import { withApiAuthRequired } from "@auth0/nextjs-auth0";
import type { NextApiRequest, NextApiResponse } from "next";
import { deleteCampaigns, getCampaigns, GetTCampaignsParams } from "../models/campaigns";
import { SORT_BY } from "../config";
import { pauseCampaign } from "../models/campaign";

export const getCampaignsHandler = withApiAuthRequired(async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const { id, targetGroupName, offset, limit, sortBy, sortDir } = req.query;
        const params: GetTCampaignsParams = {};

        if (id) {
            params.id = id as string;
        }

        if (targetGroupName) {
            params.targetGroupName = targetGroupName as string;
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

        const campaigns = await getCampaigns(params);
        return res.status(200).json(campaigns);
    } catch (err) {
        console.error("GetCampaigns", err);
        return res.status(500).json({ error: err.message });
    }
});

export const deleteCampaignsHandler = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        await deleteCampaigns();
        return res.status(200).json({ result: "OK" });
    } catch (err) {
        console.error("DeleteCampaigns:", err);
        return res.status(500).json({ error: err.message });
    }
}

export const pauseCampaignByIdHandler = withApiAuthRequired(async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const campaignId = req.query.campaignId as string;
        console.log("PauseCampaignByIdHandler:", campaignId);

        await pauseCampaign(campaignId);

        return res.status(200).json({ result: "OK" });
    } catch (err) {
        console.error("PauseCampaignByIdHandler:", err);
        return res.status(500).json({ error: err.message });
    }
});
