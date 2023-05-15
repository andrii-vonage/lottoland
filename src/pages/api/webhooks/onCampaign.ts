import { Queue, neru } from 'neru-alpha';
import type { NextApiRequest, NextApiResponse } from 'next'
import { addCampaign, getAllCustomersByCampaignId, getCustomersTemplateIds } from '../../../models/campaigns';
import { getTemplate, getTemplateAttributes } from '../../../models/templates';
import { fillTemplate } from '../../../utils';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { method, body } = req;

    switch (method) {
        case 'POST':
            const campaign = body;

            await addCampaign(campaign);

            const campaignId = campaign.CampaignID;

            const customers = await getAllCustomersByCampaignId(campaignId);
            const listOfTemplateIds = getCustomersTemplateIds(customers);

            const templates = await Promise.all(listOfTemplateIds.map(id => getTemplate(id.toString())));
            const templateAttr = getTemplateAttributes(templates);

            const customersWithData = await getAllCustomersByCampaignId(campaignId, templateAttr);

            const messages: {
                number: string;
                text: string;
            }[] = customersWithData.map((customer) => {
                const attributeData = customer.CustomerAttributes;

                const attrDict: Record<string, string> = {};

                for (let i = 0; i < templateAttr.length; i++) {
                    attrDict[templateAttr[i]] = attributeData[i];
                }

                const template = templates.find(t => t.id = customer.TemplateID);

                if (!template) {
                    throw new Error("Coudn't find a customer template to send an sms");
                }

                const number = attrDict["MobilePhone"];
                const text = fillTemplate(template.smsText, attrDict);

                return {
                    number,
                    text
                };
            });

            const queueName = campaignId.toString();
            const session = neru.createSession();
            const queue = new Queue(session);
            const queueSettings = {
                maxInflight: 5,
                msgPerSecond: 30,
                active: true
            };
            await queue.createQueue(queueName, `api/webhooks/queues/${queueName}`, queueSettings).execute()
            await queue.enqueue(queueName, messages);

            res.status(200);
            break;
        default:
            res.setHeader('Allow', ['GET', 'POST'])
            res.status(405).end(`Method ${method} Not Allowed`)
    }
}
