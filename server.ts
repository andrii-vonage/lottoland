import express, { Request, Response } from "express";
import dotenv from "dotenv";
import next from "next";

if (process.env.OPTIMOVE_ENV === "production") {
    console.log("Using production environment");
    dotenv.config({ path: ".env.production" });
} else {
    console.log("Using sandbox environment");
    dotenv.config({ path: ".env.development" });
}

import { startCronJobs } from "./src/jobs";
import { createMainQueueIfNotExists, MAIN_QUEUE_NAME } from "./src/models/queue";
import { createOnMessageEventListenerIfNotExist } from "./src/models/messages";
import { createOnCampaignListenerIfNotExist } from "./src/models/onCampaignListener";
import { state, STATE_TABLE } from "./src/models/state";

if (!process.env.NERU_CONFIGURATIONS) {
    throw new Error("Error: neru.yml file should contain configurations section with vonage-number");
}

const port = process.env.NERU_APP_PORT ? parseInt(process.env.NERU_APP_PORT) : 3000;
const dev = process.env.NODE_ENV !== "production";

const app = next({ dev, port });
const handle = app.getRequestHandler();

(async () => {
    try {
        await app.prepare();

        const server = express();

        server.use(express.urlencoded({ extended: false }));
        server.use(express.json());

        server.all("*", (req: Request, res: Response) => {
            return handle(req, res);
        });

        if (process.env.RESET_ON_START === "true") {
            await state.delete("isSaveNumbersToAssetsScheduled");
            await state.delete("onCampaignListenerAdded");
            await state.delete("onMessageEventRegistered");
            await state.delete("authToken");
            await state.hdel(STATE_TABLE.QUEUES, MAIN_QUEUE_NAME);
        }

        await startCronJobs();
        await createMainQueueIfNotExists();
        await createOnCampaignListenerIfNotExist();
        await createOnMessageEventListenerIfNotExist();

        server.listen(port, (err?: any) => {
            if (err) throw err;
            console.log(`> Ready on localhost:${port} - env ${process.env.NODE_ENV}`);
        });
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})();
