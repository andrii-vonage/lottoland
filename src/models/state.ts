import { neru, State } from "neru-alpha";

const session = neru.getGlobalSession();

export enum STATE_TABLE {
    CAMPAIGNS = "campaigns",
    TEMPLATES = "templates",
    NUMBERS = "numbers",
    QUEUES = "queues",
}

// Create a separate state object for PRODUCTION and DEVELOPMENT
export const state = new State(session, `state:${process.env.NODE_ENV}`);
