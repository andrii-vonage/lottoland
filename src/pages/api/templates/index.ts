import type { NextApiRequest, NextApiResponse } from 'next'
import { SORT_BY } from '../../../config';
import { GetTemplatesParams, addTemplate, getTemplates } from '../../../models/templates';
import { addTemplateBodySchema } from '../../../schemas';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { method, body, query } = req;
    const { name, offset, limit, sortBy, sortDir } = query;

    switch (method) {
        case 'POST':
            const { error } = addTemplateBodySchema.validate(req.body);

            if (error) {
                res.status(400).json({ error: error.details[0].message });
                return;
            }

            await addTemplate(body);
            res.status(201).json({ result: 'OK' })
            break
        case 'GET':
            const params: GetTemplatesParams = {};

            if (name) {
                params.name = name as string;
            }

            if (offset) {
                params.offset = parseInt(offset as string);
            }

            if (limit) {
                params.limit = parseInt(limit as string);
            }

            if (sortBy) {
                params.sortBy = sortBy as keyof typeof SORT_BY;
            }

            if (sortDir) {
                params.sortDir = sortDir as SORT_BY;
            }

            const r = await getTemplates(params);
            res.status(200).json(r);
            break
        default:
            res.setHeader('Allow', ['POST', 'GET'])
            res.status(405).end(`Method ${method} Not Allowed`)
    }
}