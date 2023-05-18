import type { NextApiRequest, NextApiResponse } from "next";
import { createTemplateHandler, getTemplatesHandler } from "../../../handlers";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method } = req;

    switch (method) {
        case "POST":
            return createTemplateHandler(req, res);
        case "GET":
            return getTemplatesHandler(req, res);
        default:
            res.setHeader("Allow", ["POST", "GET"]);
            res.status(405).end(`Method ${method} Not Allowed`);
    }
}
