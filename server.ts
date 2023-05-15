import express, { Request, Response } from "express";
import { neru, Queue, Messages } from 'neru-alpha';
import dotenv from 'dotenv';
import next from 'next';

if (process.env.NODE_ENV === 'production') {
    console.log('Using production environment');
    dotenv.config({ path: '.env.production' });
} else {
    console.log('Using development environment');
    dotenv.config({ path: '.env.development' });
}

import { MAIN_QUEUE_NAME } from "./src/config";
import { registerEventListener } from "./src/models/campaigns";

const port = process.env.NERU_APP_PORT ? parseInt(process.env.NERU_APP_PORT) : 3000;
const dev = process.env.NODE_ENV !== 'production';

const app = next({ dev, port });
const handle = app.getRequestHandler();

if (!process.env.NERU_CONFIGURATIONS) {
    throw new Error('Error: neru.yml file should contain configurations section with vonage-number')
}

const configurations = JSON.parse(process.env.NERU_CONFIGURATIONS);
const VONAGE_NUMBER = configurations["vonage-number"];


const session = neru.getGlobalSession();
const queueApi = new Queue(session);
const messagesApi = new Messages(session);


(async () => {
    try {
        await app.prepare();

        const server = express();

        server.use(express.urlencoded({ extended: false }));
        server.use(express.json());

        server.all('*', (req: Request, res: Response) => {
            return handle(req, res);
        });

        await registerEventListener('api/webhooks/onCampaign');

        try {
            // Create main delivery queue if not created
            await queueApi.createQueue(MAIN_QUEUE_NAME, "api/webhooks/onMessage", {
                maxInflight: 5,
                msgPerSecond: 30,
                active: true
            }).execute();
        } catch (err) {
        }

        // Listen for sms events
        await messagesApi.onMessageEvents('api/webhooks/onMessageEvent', {
            type: 'sms',
            number: VONAGE_NUMBER
        }, {
            type: 'sms',
            number: null
        }).execute();


        server.listen(port, (err?: any) => {
            if (err) throw err;
            console.log(`> Ready on localhost:${port} - env ${process.env.NODE_ENV}`);
        });
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})();