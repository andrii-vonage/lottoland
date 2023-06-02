import express, { Request, Response } from "express";
import next from "next";
import { startCronJobs } from "./src/jobs";
import { createMainQueueIfNotExists, MAIN_QUEUE_NAME } from "./src/models/queue";
import { createOnMessageEventListenerIfNotExist } from "./src/models/messages";
import { createOnCampaignListenerIfNotExist } from "./src/models/onCampaignListener";
import { state, STATE_TABLE } from "./src/models/state";

if (process.env.NODE_ENV !== "production") {
    process.env.AUTH0_BASE_URL = "http://localhost:3000";
}

console.log('neru-app: starting...')

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

        // if (process.env.RESET_ON_START === "true") {
        //     await state.delete(STATE_TABLE.QUEUES);
        //     await state.delete("isSaveNumbersToAssetsScheduled");
        //     await state.delete("onCampaignListenerAdded");
        //     await state.delete("onMessageEventRegistered");
        // await state.delete("authToken");
        // }

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
