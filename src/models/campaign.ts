import { addDaysToTimestamp, timestampToYMD } from "../utils";
import { getCampaignDetails } from "./campaignDetails";
import { state, STATE_TABLE } from "./state";
import { API_BASE_URL, CAMPAIGN_CHANNEL, OPTIMOVE_DELIVERY_STATUS, OPTIMOVE_ENDPOINT, REQUEST_VERB } from "../config";
import { apiClient } from "../apiClient";
import { queue } from "./queue";

export enum CAMPAIGN_STATUS {
    RUNNING = "Running",
    PAUSED = "Paused",
}

export class Campaign {
    id: number;
    targetGroupName: string;
    actions: string[];
    startDate: string;
    endDate: string;
    status: CAMPAIGN_STATUS;

    constructor(params: {
        id: number;
        targetGroupName: string;
        actions: string[];
        startDate: string;
        endDate: string;
    }) {
        this.id = params.id;
        this.targetGroupName = params.targetGroupName;
        this.actions = params.actions;
        this.startDate = params.startDate;
        this.endDate = params.endDate;
        this.status = CAMPAIGN_STATUS.RUNNING;
    }
}

export interface CampaignCustomer {
    CustomerID: string;
    TemplateID: number;
    ScheduledTime: string;
    CustomerAttributes: string[];
}

const getActionName = async (
    id: number
): Promise<{
    ActionName: string;
}> => {
    const urlObject = new URL(OPTIMOVE_ENDPOINT.GET_ACTION_NAME, API_BASE_URL);
    urlObject.searchParams.append("ActionID", id.toString());

    const url = urlObject.href;
    const r = await apiClient(url, { method: REQUEST_VERB.GET });

    return await r.json();
};

const getTargetGroupName = async (id: number): Promise<string> => {
    const urlObject = new URL(OPTIMOVE_ENDPOINT.GET_TARGET_GROUP_NAME, API_BASE_URL);
    urlObject.searchParams.append("TargetGroupID", id.toString());

    const url = urlObject.href;
    const r = await apiClient(url, { method: REQUEST_VERB.GET });

    const response: {
        TargetGroupName: string;
    } = await r.json();

    return response.TargetGroupName;
};

const getActionsByTargetGroup = async (
    targetGroupId: number,
    date: string
): Promise<
    {
        RecipientGroupID: number;
        ActionID: number;
    }[]
> => {
    const urlObject = new URL(OPTIMOVE_ENDPOINT.GET_ACTIONS_BY_TARGET_GROUP, API_BASE_URL);
    urlObject.searchParams.append("TargetGroupID", targetGroupId.toString());
    urlObject.searchParams.append("Date", date);

    const url = urlObject.href;
    const r = await apiClient(url, { method: REQUEST_VERB.GET });

    return await r.json();
};

export const addCampaign = async (params: { EventTypeID: number; TimeStamp: string; CampaignID: number }) => {
    const campaignStartDate = timestampToYMD(params.TimeStamp);
    const campaignDetails = await getCampaignDetails(params.CampaignID);
    // TODO: Optimove doesn't provide a way to get the target group name
    // const targetGroupName = await getTargetGroupName(campaignDetails.TargetGroupID);
    const targetGroupName = `TestName:${campaignDetails.TargetGroupID.toString()}`;
    // TODO: Optimove doesn't provide a way to get the action name
    // const actionsWithIDs = await getActionsByTargetGroup(campaignDetails.TargetGroupID, campaignStartDate);
    // const actionNames = (await Promise.all(actionsWithIDs.map((a) => getActionName(a.ActionID)))).map(
    //     (r) => r.ActionName
    // );
    const actionNames = [`TestAction:${campaignDetails.TargetGroupID.toString()}`];
    const campaignEndDate = timestampToYMD(addDaysToTimestamp(params.TimeStamp, campaignDetails.Duration));


    const campaign = new Campaign({
        id: params.CampaignID,
        targetGroupName,
        actions: actionNames,
        startDate: campaignStartDate,
        endDate: campaignEndDate,
    });

    await state.hset(STATE_TABLE.CAMPAIGNS, { [campaign.id]: JSON.stringify(campaign) });
}

export const getCampaignCustomers = async (
    campaignID: number,
    pageSize: number = 100,
    skip: number = 0,
    attributes?: string[]
) => {
    const urlObject = new URL(OPTIMOVE_ENDPOINT.GET_CUSTOMER_SEND_DETAILS_BY_CHANNEL, API_BASE_URL);
    urlObject.searchParams.append("CampaignID", campaignID.toString());
    urlObject.searchParams.append("ChannelID", CAMPAIGN_CHANNEL.SMS.toString());

    if (attributes && attributes.length) {
        urlObject.searchParams.append("CustomerAttributes", attributes.join(";"));
    }

    if (pageSize) {
        urlObject.searchParams.append("$top", pageSize.toString());
    }

    if (skip) {
        urlObject.searchParams.append("$skip", skip.toString());
    }

    const url = urlObject.href;

    return apiClient(url, { method: REQUEST_VERB.GET });
};

export const getAllCustomersByCampaignId = async (
    campaignID: number,
    attributes?: string[]
): Promise<CampaignCustomer[]> => {
    const pageSize = 100;
    let skip = 0;
    let customers: CampaignCustomer[] = [];
    let r = await getCampaignCustomers(campaignID, pageSize, skip, attributes);
    let result: CampaignCustomer[] = await r.json();

    while (result.length > 0) {
        customers = customers.concat(result);
        skip += pageSize;
        r = await getCampaignCustomers(campaignID, pageSize, skip, attributes);
        result = await r.json();
    }

    return customers;
};

export class CampaignSMSMetric {
    ChannelID: CAMPAIGN_CHANNEL;
    CampaignID: number;
    TemplateID: number;
    MetricID: number;
    MetricValue: number;

    constructor(params: { CampaignID: number; TemplateID: number; MetricID: number; MetricValue: number }) {
        this.ChannelID = CAMPAIGN_CHANNEL.SMS;
        this.CampaignID = params.CampaignID;
        this.TemplateID = params.TemplateID;
        this.MetricID = params.MetricID;
        this.MetricValue = params.MetricValue;
    }
}

export const updateCampaignMetrics = async (
    campaignID: number,
    templateID: number,
    metrics: {
        id: OPTIMOVE_DELIVERY_STATUS;
        value: number;
    }[]
) => {
    const method = REQUEST_VERB.POST;
    const url = new URL(OPTIMOVE_ENDPOINT.UPDATE_CAMPAIGN_METRICS, API_BASE_URL).href;
    const body: CampaignSMSMetric[] = [];

    for (const metric of metrics) {
        const m = new CampaignSMSMetric({
            CampaignID: campaignID,
            TemplateID: templateID,
            MetricID: metric.id,
            MetricValue: metric.value,
        });

        body.push(m);
    }

    return apiClient(url, { method, body: JSON.stringify(body) });
};

export const pauseCampaign = async (id: string) => {
    await queue.pauseQueue(id).execute();
    await updateCampaignStatus(id, CAMPAIGN_STATUS.PAUSED);
}

const updateCampaignStatus = async (id: string, status: CAMPAIGN_STATUS) => {
    const campaign = await state.hget(STATE_TABLE.CAMPAIGNS, id);

    if (!campaign) {
        throw new Error(`Campaign with id ${id} not found`);
    }

    const c: Campaign = JSON.parse(campaign);
    c.status = status;

    await state.hset(STATE_TABLE.CAMPAIGNS, { [c.id]: JSON.stringify(c) });
}


