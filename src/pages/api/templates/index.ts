import type { NextApiRequest, NextApiResponse } from 'next'
import { addTemplate, getTemplates } from 'src/models/templates';
import validateRequestBody from './validateRequestBody';
import { SORT_BY } from 'src/models/constants';
import { IGetTemplatesParams } from 'src/models/templates/interfaces';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { method, body, query } = req;
    const { name, offset, limit, sortBy, sortDir } = query;

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

            await addTemplate(body);
            res.status(201).json({ result: 'OK' })
            break
        case 'GET':
            const params: IGetTemplatesParams = {};

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
            res.status(200).json(r)
            break
        default:
            res.setHeader('Allow', ['POST', 'GET'])
            res.status(405).end(`Method ${method} Not Allowed`)
    }
}