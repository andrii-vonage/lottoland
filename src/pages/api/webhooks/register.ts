import type { NextApiRequest, NextApiResponse } from 'next'
import { registerEventListener } from 'src/models/campaigns';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { method } = req;

    switch (method) {
        case 'POST':
            await registerEventListener('/api/webhooks/onCampaign');
            res.status(200).json({ result: "OK" });
            break;
        default:
            res.setHeader('Allow', ['POST'])
            res.status(405).end(`Method ${method} Not Allowed`);
    }
}