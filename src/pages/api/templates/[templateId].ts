import type { NextApiRequest, NextApiResponse } from 'next'
import { addTemplate, deleteTemplate, getTemplate } from '../../../models/templates';
import validateRequestBody from './validateRequestBody';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { method, body } = req;
    const templateId = req.query.templateId as string;

    if (!templateId) {
        res.status(400).json({ message: 'Template ID is required' });
        return;
    }

    switch (method) {
        case 'PUT':
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

            await addTemplate(body);
            res.status(200).json({ result: 'OK' })
            break
        case 'DELETE':
            await deleteTemplate(templateId);
            res.status(200).json({ result: 'OK' })
            break
        case 'GET':
            const template = await getTemplate(templateId);

            if (!template) {
                res.status(404).json({ message: 'Template not found' });
                return;
            }

            res.status(200).json({ result: template })
            break
        default:
            res.setHeader('Allow', ['PUT', 'GET', 'DELETE'])
            res.status(405).end(`Method ${method} Not Allowed`)
    }
}