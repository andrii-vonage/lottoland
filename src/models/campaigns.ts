import { neru } from 'neru-alpha';
import { EVENT_TYPE, CHANNEL, METRIC_ID, OPTIMOVE_ENDPOINT, REQUEST_VERB } from '../config';
import { addDaysToTimestamp, timestampToYMD } from '../utils';
import { apiClient } from '../apiClient';

const state = neru.getAccountState();

const API_BASE_URL = process.env.API_BASE_URL;
const appURL = neru.getAppUrl();
const CAMPAIGN_KEY = 'campaigns';

export interface GetCampaignCustomersResponseItem {
    CustomerID: string;
    TemplateID: number;
    ScheduledTime: string;
    CustomerAttributes: string[]
}

export const registerEventListener = async (callback: string) => {
    const url = new URL(OPTIMOVE_ENDPOINT.REGISTER_EVENT_LISTENER, API_BASE_URL).href
    const callbackUrl = new URL(callback, appURL).href
    const method = REQUEST_VERB.POST;

    const body = JSON.stringify({
        EventTypeID: EVENT_TYPE.REALTIME,
        ChannelID: CHANNEL.SMS,
        ListenerURL: callbackUrl,
    });

    await apiClient(url, { method, body });
}

const getCampaignDetails = async (id: number): Promise<{
    TargetGroupID: number;
    CampaignType: string;
    Duration: number;
    LeadTime: number;
    Notes: string;
    IsMultiChannel: boolean;
    IsRecurrence: boolean;
    Status: string;
    Error: string;
    Tags: string[];
}> => {
    const urlObject = new URL(OPTIMOVE_ENDPOINT.GET_CAMPAIGN_DETAILS, API_BASE_URL);
    urlObject.searchParams.append('CampaignID', id.toString());

    const url = urlObject.href;
    const r = await apiClient(url, { method: REQUEST_VERB.GET });

    return await r.json();
}

const getTargetGroupName = async (id: number): Promise<string> => {
    const urlObject = new URL(OPTIMOVE_ENDPOINT.GET_TARGET_GROUP_NAME, API_BASE_URL);
    urlObject.searchParams.append('TargetGroupID', id.toString());

    const url = urlObject.href;
    const r = await apiClient(url, { method: REQUEST_VERB.GET });

    const response: {
        TargetGroupName: string;
    } = await r.json();
    return response.TargetGroupName;
}

const getActionsByTargetGroup = async (targetGroupId: number, date: string): Promise<{
    RecipientGroupID: number;
    ActionID: number;
}[]> => {
    const urlObject = new URL(OPTIMOVE_ENDPOINT.GET_ACTIONS_BY_TARGET_GROUP, API_BASE_URL);
    urlObject.searchParams.append('TargetGroupID', targetGroupId.toString());
    urlObject.searchParams.append('Date', date);

    const url = urlObject.href;
    const r = await apiClient(url, { method: REQUEST_VERB.GET });

    return await r.json();
}

const getActionName = async (id: number): Promise<{
    ActionName: string;
}> => {
    const urlObject = new URL(OPTIMOVE_ENDPOINT.GET_ACTION_NAME, API_BASE_URL);
    urlObject.searchParams.append('ActionID', id.toString());

    const url = urlObject.href;
    const r = await apiClient(url, { method: REQUEST_VERB.GET });

    return await r.json();
}

export const deleteCampaigns = async () => {
    await state.delete(CAMPAIGN_KEY);
}

export const addCampaign = async (params: {
    EventTypeID: number;
    TimeStamp: string;
    CampaignID: number
}) => {
    const campaignStartDate = timestampToYMD(params.TimeStamp);
    const campaignDetails = await getCampaignDetails(params.CampaignID);
    const targetGroupName = await getTargetGroupName(campaignDetails.TargetGroupID);
    const actionsWithIDs = await getActionsByTargetGroup(campaignDetails.TargetGroupID, campaignStartDate);
    const actionNames = (await Promise.all(actionsWithIDs.map((a => getActionName(a.ActionID))))).map(r => r.ActionName);
    const campaignEndDate = timestampToYMD(addDaysToTimestamp(params.TimeStamp, campaignDetails.Duration));

    const c: {
        id: number;
        targetGroupName: string;
        actions: string[];
        startDate: string;
        endDate: string;
    } = {
        id: params.CampaignID,
        targetGroupName,
        actions: actionNames,
        startDate: campaignStartDate,
        endDate: campaignEndDate
    };

    await state.hset(CAMPAIGN_KEY, { [c.id]: JSON.stringify(c) });
}

export const getCampaignCustomers = async (campaignID: number, pageSize: number = 100, skip: number = 0, attributes?: string[]) => {
    const urlObject = new URL(OPTIMOVE_ENDPOINT.GET_CUSTOMER_SEND_DETAILS_BY_CHANNEL, API_BASE_URL);
    urlObject.searchParams.append('CampaignID', campaignID.toString());
    urlObject.searchParams.append('ChannelID', CHANNEL.SMS.toString());

    if (attributes && attributes.length) {
        urlObject.searchParams.append('CustomerAttributes', attributes.join(';'));
    }

    if (pageSize) {
        urlObject.searchParams.append('$top', pageSize.toString());
    }

    if (skip) {
        urlObject.searchParams.append('$skip', skip.toString());
    }

    const url = urlObject.href;

    return apiClient(url, { method: REQUEST_VERB.GET });
}

export const getAllCustomersByCampaignId = async (campaignID: number, attributes?: string[]): Promise<GetCampaignCustomersResponseItem[]> => {
    const pageSize = 100;
    let skip = 0;
    let customers: GetCampaignCustomersResponseItem[] = [];
    let r = await getCampaignCustomers(campaignID, pageSize, skip, attributes);
    let result: GetCampaignCustomersResponseItem[] = await r.json();

    while (result.length > 0) {
        customers = customers.concat(result);
        skip += pageSize;
        r = await getCampaignCustomers(campaignID, pageSize, skip, attributes);
        result = await r.json();
    }

    return customers;
}

export const getCustomersTemplateIds = (customers: GetCampaignCustomersResponseItem[]): number[] => {
    return [...new Set(customers.map(customer => customer.TemplateID))];
}

export const updateCampaignMetrics = async (campaignID: number, templateID: number, metrics: {
    id: METRIC_ID;
    value: number;
}[]) => {
    const method = REQUEST_VERB.POST;
    const url = new URL(OPTIMOVE_ENDPOINT.UPDATE_CAMPAIGN_METRICS, API_BASE_URL).href;
    const body: {
        ChannelID: number;
        CampaignID: number;
        TemplateID: number;
        MetricID: number;
        MetricValue: number;
    }[] = [];

    for (const metric of metrics) {
        const m = {
            ChannelID: CHANNEL.SMS,
            CampaignID: campaignID,
            TemplateID: templateID,
            MetricID: metric.id,
            MetricValue: metric.value,
        }

        body.push(m);
    }

    return apiClient(url, { method, body: JSON.stringify(body) });
}

export const getCampaigns = async () => {
    const campaigns: string[] = await state.hvals(CAMPAIGN_KEY);

    const r = [];

    for (const campaign of campaigns) {
        r.push(JSON.parse(campaign));
    }
    return r;
}