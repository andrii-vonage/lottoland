import { Queue, neru } from 'neru-alpha';
import type { NextApiRequest, NextApiResponse } from 'next'
import { GetCampaignCustomersResponseItem, addCampaign, getAllCustomersByCampaignId, getCustomersTemplateIds } from '../../../models/campaigns';
import { Template, getTemplate, getTemplateAttributes } from '../../../models/templates';
import { fillTemplate } from '../../../utils';
import { onCampaignBodySchema } from '../../../schemas';
import { EVENT_TYPE } from 'src/config';

const session = neru.getGlobalSession();
const queueApi = new Queue(session);

const createSMSMessages = (customers: GetCampaignCustomersResponseItem[], templates: Template[], templatePlaceholders: string[]) => {
    return customers.map((customer) => {
        const attrList = customer.CustomerAttributes;
        const attrDict: Record<string, string> = {};

        for (let i = 0; i < templatePlaceholders.length; i++) {
            attrDict[templatePlaceholders[i]] = attrList[i];
        }

        const template = templates.find(t => t.id = customer.TemplateID);
        const number = attrDict["MobilePhone"];
        const text = fillTemplate(template.smsText, attrDict);

        return {
            number,
            text
        };
    });
}

interface OnCampaignBody {
    CampaignID: number;
    EventTypeID: EVENT_TYPE;
    TimeStamp: string;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { method, body } = req;

    switch (method) {
        case 'POST':

            const { error } = onCampaignBodySchema.validate(req.body);

            if (error) {
                res.status(400).json({ error: error.details[0].message });
                return;
            }

            const campaign: OnCampaignBody = body;

            const campaignId = campaign.CampaignID;
            const queueName = campaignId.toString();
            let customers: GetCampaignCustomersResponseItem[];
            let templates: Template[];
            let customersWithData: GetCampaignCustomersResponseItem[];

            try {
                await addCampaign(campaign);
            } catch (e) {
                throw new Error("Couldn't add campaign to the database");
            }

            try {
                customers = await getAllCustomersByCampaignId(campaignId);
            } catch (e) {
                throw new Error("Couldn't get customers from the database");
            }

            const templateIds = getCustomersTemplateIds(customers);

            try {
                templates = await Promise.all(templateIds.map(id => getTemplate(id.toString())));
            } catch (e) {
                throw new Error("Couldn't get templates from the database");
            }

            const templateAttributes = getTemplateAttributes(templates);

            try {
                customersWithData = await getAllCustomersByCampaignId(campaignId, templateAttributes);
            } catch (e) {
                throw new Error("Couldn't get customers with attributes from the database");
            }

            const messages = createSMSMessages(customersWithData, templates, templateAttributes);

            let queueAlreadyExists = false;

            try {
                const details = await queueApi.getQueueDetails(queueName).execute();
                if (details) {
                    queueAlreadyExists = true;
                }
            } catch (e) {
                if (e.response.status === 404) {
                    queueAlreadyExists = false;
                } else {
                    throw e;
                }
            }

            if (!queueAlreadyExists) {
                try {
                    await queueApi.createQueue(queueName, `api/webhooks/queues/${queueName}`, {
                        maxInflight: 5,
                        msgPerSecond: 30,
                        active: true
                    }).execute();
                } catch (e) {
                    throw new Error("Couldn't create queue");
                }
            }

            await queueApi.enqueue(queueName, messages).execute();

            return res.status(200).send('OK');
        default:
            res.setHeader('Allow', ['GET', 'POST'])
            res.status(405).end(`Method ${method} Not Allowed`)
    }
}
