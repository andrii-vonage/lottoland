import { NextApiRequest, NextApiResponse } from "next";
import { saveNumbersToAssets } from "../models/numbers";
import { onCampaignBodySchema, onMessageSchema, onQueueMessageBodySchema } from "../schemas";
import { onCampaign, OnCampaignBody } from "../models/onCampaign";
import { Message, onMessage, onMessageEvent } from "../models/messages";
import { onQueueMessage } from "../models/queue";

export const onCampaignHandler = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        console.log("OnCampaignHandler:", req.body);
        const { error } = onCampaignBodySchema.validate(req.body);

        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const body = req.body as OnCampaignBody;
        await onCampaign(body);

        return res.status(200).json({ result: "OK" });
    } catch (err) {
        console.error("OnCampaignHandler:", err);
        return res.status(500).json({ error: err.message });
    }
};

export const onMessageHandler = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const body = req.body;
        console.log("OnMessageHandler:", body);
        const { error } = onMessageSchema.validate(body);

        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        await onMessage(body);

        return res.status(200).json({ result: "OK" });
    } catch (err) {
        console.error("OnMessageHandler:", err);
        return res.status(500).json({ error: err.message });
    }
};

export const onMessageEventHandler = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        console.log("OnMessageEventHandler:", req.body);
        await onMessageEvent(req.body);

        res.status(200).json({ result: "OK" });
    } catch (err) {
        console.error("OnMessageEventHandler:", err);
        return res.status(500).json({ error: err.message });
    }
};

export const onQueueMessageHandler = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const message = req.body as Message;
        const queueName = req.query.queueName as string;

        const { error } = onQueueMessageBodySchema.validate(message);

        if (error) {
            console.log("OnQueueMessageHandler:", error);
            return res.status(400).json({ error: error.details[0].message });
        }

        await onQueueMessage(queueName, message);

        return res.status(200).json({ result: "OK" });
    } catch (err) {
        console.error("OnQueueMessageHandler:", err);
        return res.status(500).json({ error: err.message });
    }
};

export const onMessageReceiptSaveEvent = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        await saveNumbersToAssets();
        return res.status(200).json({ result: "OK" });
    } catch (e) {
        console.error("OnSaveNumbersEvents:", e);
        return res.status(500).json({ error: e.message });
    }
};
