import type { NextApiRequest, NextApiResponse } from 'next'
import { deleteCampaignsHandler, getCampaignsHandler } from '../../../handlers';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { method } = req;

    switch (method) {
        case 'GET':
            return getCampaignsHandler(req, res);
        case 'DELETE':
            return deleteCampaignsHandler(req, res);
        default:
            res.setHeader('Allow', ['GET', 'DELETE'])
            res.status(405).end(`Method ${method} Not Allowed`)
    }
}