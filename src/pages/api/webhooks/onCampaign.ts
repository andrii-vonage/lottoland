import type { NextApiRequest, NextApiResponse } from "next";
import { onCampaignHandler } from "../../../handlers";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method } = req;

    switch (method) {
        case "POST":
            return onCampaignHandler(req, res);
        default:
            res.setHeader("Allow", ["GET", "POST"]);
            res.status(405).end(`Method ${method} Not Allowed`);
    }
}
