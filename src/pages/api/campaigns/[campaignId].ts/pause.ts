import type { NextApiRequest, NextApiResponse } from 'next'
import { Queue, neru } from 'neru-alpha';

const session = neru.getGlobalSession();
const queueApi = new Queue(session);

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { method } = req;
    const campaignId = req.query.campaignId as string;

    switch (method) {
        case 'POST':
            
            await queueApi.pauseQueue(campaignId).execute();
            
            res.status(200).send('OK');
        default:
            res.setHeader('Allow', ['POST'])
            res.status(405).end(`Method ${method} Not Allowed`)
    }
}