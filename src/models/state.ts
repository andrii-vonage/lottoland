import { neru, State } from "neru-alpha";

export enum STATE_TABLE {
    CAMPAIGNS = "campaigns",
    TEMPLATES = "templates",
    NUMBERS = "numbers",
    QUEUES = "queues",
}

const globalSession = neru.getGlobalSession();

export const state = new State(globalSession, `state:${process.env.OPTIMOVE_ENV}`);
