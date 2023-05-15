import type { NextApiRequest, NextApiResponse } from 'next'
import { Messages, neru, SMSMessage } from 'neru-alpha';
import { callbackMessageSchema } from '../../../schemas';
import { apiClient } from '../../../apiClient';

const configurations = JSON.parse(process.env.NERU_CONFIGURATIONS);
const VONAGE_NUMBER = configurations["vonage-number"];
const session = neru.getGlobalSession();
const messagesApi = new Messages(session);

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { method, body } = req;

    switch (method) {
        case 'POST':
            const { error } = callbackMessageSchema.validate(req.body);

            if (error) {
                res.status(400).json({ error: error.details[0].message });
                return;
            }

            const message = body as {
                number: string;
                text: string;
            };

            const sms = new SMSMessage();
            sms.text = message.text;
            sms.to = message.number;
            sms.from = VONAGE_NUMBER;

            // await messagesApi.send(sms).execute();
            // TODO: remove before production
            await apiClient('https://test-log.free.beeceptor.com', { method: 'POST', body: JSON.stringify(message) });

            res.status(200).send('OK');
            break;
        default:
            res.setHeader('Allow', ['POST'])
            res.status(405).end(`Method ${method} Not Allowed`)
    }
}