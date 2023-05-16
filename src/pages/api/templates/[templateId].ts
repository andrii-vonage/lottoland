import type { NextApiRequest, NextApiResponse } from 'next'
import { deleteTemplate, getTemplate, updateTemplate } from '../../../models/templates';
import { updateTemplateBodySchema } from '../../../schemas';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { method, body } = req;
    const templateId = req.query.templateId as string;

    switch (method) {
        case 'GET':
            const template = await getTemplate(templateId);

            if (!template) {
                return res.status(404).json({ message: 'Template not found' });
            }

            return res.status(200).json({ result: template });
        case 'PUT':
            const { error } = updateTemplateBodySchema.validate(req.body);

            if (error) {
                return res.status(400).json({ error: error.details[0].message });
            }

            await updateTemplate(body);
            return res.status(200).json({ result: 'OK' });
        case 'DELETE':
            await deleteTemplate(templateId);
            return res.status(200).json({ result: 'OK' });
        default:
            res.setHeader('Allow', ['PUT', 'GET', 'DELETE'])
            res.status(405).end(`Method ${method} Not Allowed`)
    }
}