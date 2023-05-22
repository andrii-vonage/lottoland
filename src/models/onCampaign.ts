import { EVENT_TYPE } from "../config";
import { getTemplate, getTemplateAttributes, Template } from "./templates";
import { addCampaign, CampaignCustomer, getAllCustomersByCampaignId } from "./campaign";
import { createSMSMessages } from "./messages";
import { createQueueIfNotExists, queue } from "./queue";

export interface OnCampaignBody {
    CampaignID: number;
    EventTypeID: EVENT_TYPE;
    TimeStamp: string;
}

const collectUniqueTemplateIds = (customers: CampaignCustomer[]): number[] => {
    return [...new Set(customers.map((customer) => customer.TemplateID))];
};

export const onCampaign = async (body: OnCampaignBody): Promise<void> => {
    const campaign: OnCampaignBody = body;

    const campaignId = campaign.CampaignID;
    const queueName = campaignId.toString();
    let customers: CampaignCustomer[];
    let templates: Template[];
    let customersWithData: CampaignCustomer[];

    try {
        await addCampaign(campaign);
    } catch (err) {
        throw new Error("Couldn't add campaign to the database:" + err.message);
    }

    try {
        customers = await getAllCustomersByCampaignId(campaignId);
    } catch (e) {
        throw new Error("Couldn't get customers from the database");
    }

    const templateIds = collectUniqueTemplateIds(customers);

    try {
        templates = await Promise.all(templateIds.map((id) => getTemplate(id.toString())));
    } catch (e) {
        throw new Error("Couldn't get templates from the database");
    }

    const templateAttributes = getTemplateAttributes(templates);

    try {
        customersWithData = await getAllCustomersByCampaignId(campaignId, templateAttributes);
    } catch (e) {
        throw new Error("Couldn't get customers with attributes from the database");
    }

    const messages = createSMSMessages(campaignId, customersWithData, templates, templateAttributes);

    await createQueueIfNotExists(queueName, `api/webhooks/queues/${queueName}`, {
        maxInflight: 5,
        msgPerSecond: 30,
        active: true,
    });

    await queue.enqueue(queueName, messages).execute();
};
