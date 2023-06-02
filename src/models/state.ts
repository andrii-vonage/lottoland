import { neru } from "neru-alpha";

export enum STATE_TABLE {
    CAMPAIGNS = "campaigns",
    TEMPLATES = "templates",
    NUMBERS = "numbers",
    QUEUES = "queues",
}

export const state = neru.getInstanceState();
