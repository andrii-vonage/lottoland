import express, { Request, Response } from "express";
import dotenv from "dotenv";
import next from "next";

if (process.env.NODE_ENV === "production") {
    console.log("Using production environment");
    dotenv.config({ path: ".env.production" });
} else {
    console.log("Using development environment");
    dotenv.config({ path: ".env.development" });
}

import { createMainQueueIfNotExists } from "./src/models/queue";
import { createOnMessageEventListenerIfNotExist } from "./src/models/messages";
import { createOnCampaignListenerIfNotExist } from "./src/models/onCampaignListener";


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
