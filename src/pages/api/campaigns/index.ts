import type { NextApiRequest, NextApiResponse } from 'next'
import { getCampaigns } from 'src/models/campaigns';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { method, body } = req;

    switch (method) {
        case 'GET':
            const c = await getCampaigns();
            res.status(200).json({ result: c })
            break
        default:
            res.setHeader('Allow', ['GET'])
            res.status(405).end(`Method ${method} Not Allowed`)
    }
}