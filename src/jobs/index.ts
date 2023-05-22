import { scheduler } from "../models/scheduler";
import {state} from "../models/state";

export const scheduleSaveNumbersToAssetsEveryHour = async () => {
    console.log("Schedule a call to save numbers to assets API");
    const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    try {
        const isScheduled = await state.get("isSaveNumbersToAssetsScheduled");

        if (isScheduled) {
            console.log("Save numbers to assets API already scheduled, skip");
            return;
        }

        await scheduler
            .startAt({
                startAt: oneHourFromNow,
                callback: "api/jobs/numbers-to-assets",
                interval: {
                    cron: "0 * * * *",
                    until: null,
                },
            })
            .execute();

        await state.set("isSaveNumbersToAssetsScheduled", true);
    } catch (e) {
        console.error("Error while scheduling save numbers to assets API:", e.message);
        throw new Error("Error while scheduling save numbers to assets API:" + e.message);
    }
};

export const startCronJobs = async () => {
    console.log("Starting cron jobs");

    await scheduleSaveNumbersToAssetsEveryHour();
};
