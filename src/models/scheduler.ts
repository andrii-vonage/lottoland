import { neru, Scheduler } from "neru-alpha";

const session = neru.createSession();
export const scheduler = new Scheduler(session);
