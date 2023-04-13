import type { NextApiRequest, NextApiResponse } from 'next'
import { saveTemplate, getTemplates } from '../../../models/templates';
import validateRequestBody from './validateRequestBody';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { method, body } = req;

    switch (method) {
        case 'POST':
            try {
                validateRequestBody(body);
            } catch (error) {
                if (error instanceof Error) {
                    res.status(400).json({ message: error.message });
                } else {
                    res.status(400).json({ message: 'An unexpected error occurred during validation' });
                }
                return;
            }

            await saveTemplate(body);
            res.status(201).json({ result: 'OK' })
            break
        case 'GET':
            const templates = await getTemplates();
            res.status(200).json({ result: templates })
            break
        default:
            res.setHeader('Allow', ['POST', 'GET'])
            res.status(405).end(`Method ${method} Not Allowed`)
    }
}