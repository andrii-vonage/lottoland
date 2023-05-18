import type { NextApiRequest, NextApiResponse } from "next";
import { deleteTemplateHandler, getTemplateHandler, updateTemplateHandler } from "../../../handlers";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method } = req;

    switch (method) {
        case "GET":
            return getTemplateHandler(req, res);
        case "PUT":
            return updateTemplateHandler(req, res);
        case "DELETE":
            return deleteTemplateHandler(req, res);
        default:
            res.setHeader("Allow", ["PUT", "GET", "DELETE"]);
            res.status(405).end(`Method ${method} Not Allowed`);
    }
}
