import { withApiAuthRequired } from "@auth0/nextjs-auth0";
import { NextApiRequest, NextApiResponse } from "next";
import { getOptedOutNumbers, optIn, OptInOutAction, OptInOutBody, optOut } from "../models/numbers";
import { optInOutBodySchema } from "../schemas";

export const optInOutHandler = withApiAuthRequired(async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const { error } = optInOutBodySchema.validate(req.body);

        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const body = req.body as OptInOutBody;
        const { action, phoneNumber, phoneCountryCode } = body;

        if (action === OptInOutAction.OPT_IN) {
            await optIn(phoneCountryCode + phoneNumber);
            return res.status(200).json({ result: "OK" });
        } else if (action === OptInOutAction.OPT_OUT) {
            await optOut(phoneCountryCode + phoneNumber);
            return res.status(200).json({ result: "OK" });
        }

        await optOut(req.body.number);
        return res.status(200).json({ result: "OK" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message });
    }
});

export const getNumbersHandler = withApiAuthRequired(async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const numbers = await getOptedOutNumbers();
        return res.status(200).json({ result: numbers });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message });
    }
});
