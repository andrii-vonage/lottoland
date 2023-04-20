import type { NextApiRequest, NextApiResponse } from 'next'
import { registerEventListener } from 'src/models/campaigns';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { method, body } = req;

    switch (method) {
        case 'GET':
            await registerEventListener('/api/webhooks');
            res.status(200).json({ result: "OK" })
            break
        case 'POST':
            console.log("webhook", body);
            res.status(200).json({ result: "OK" })
        default:
            res.setHeader('Allow', ['GET', 'POST'])
            res.status(405).end(`Method ${method} Not Allowed`)
    }
}