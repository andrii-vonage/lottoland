import type { NextApiRequest, NextApiResponse } from "next";
import { onMessageHandler } from "../../../handlers";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method } = req;

    switch (method) {
        case "POST":
            return onMessageHandler(req, res);
        default:
            res.setHeader("Allow", ["POST"]);
            res.status(405).end(`Method ${method} Not Allowed`);
    }
}
