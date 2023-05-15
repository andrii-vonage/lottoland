import type { NextApiRequest, NextApiResponse } from 'next'
import { deleteCampaigns, getCampaigns } from '../../../models/campaigns';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { method } = req;

    switch (method) {
        case 'GET':
            const c = await getCampaigns();
            res.status(200).json({ result: c })
            break
        case 'DELETE':
            await deleteCampaigns();
            res.status(200).send('OK');
        default:
            res.setHeader('Allow', ['GET', 'DELETE'])
            res.status(405).end(`Method ${method} Not Allowed`)
    }
}