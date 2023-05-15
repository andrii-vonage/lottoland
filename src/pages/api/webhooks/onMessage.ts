import type { NextApiRequest, NextApiResponse } from 'next'
import { Messages, neru, SMSMessage } from 'neru-alpha';

if (!process.env.NERU_CONFIGURATIONS) {
    throw new Error('Error: neru.yml file should contain configurations section with vonage-number')
}

const configurations = JSON.parse(process.env.NERU_CONFIGURATIONS);
const VONAGE_NUMBER = configurations["vonage-number"];

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { method, body } = req;

    switch (method) {
        case 'POST':
            const message = body as {
                number: string;
                text: string;
            };

            const session = neru.createSession();
            const messagesAPI = new Messages(session);

            const sms = new SMSMessage();
            sms.text = message.text;
            sms.to = message.number;
            sms.from = VONAGE_NUMBER;

            await messagesAPI.send(sms).execute();

            res.status(200).send('OK');
            break;
        default:
            res.setHeader('Allow', ['POST'])
            res.status(405).end(`Method ${method} Not Allowed`)
    }
}