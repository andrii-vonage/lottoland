import { neru, Queue, QueueDetailsResponse } from "neru-alpha";
import { Message } from "./messages";
import { state } from "./state";

const MAIN_QUEUE_NAME = "MAIN_QUEUE";

const session = neru.getGlobalSession();
export const queue = new Queue(session);

const queueCache: Record<string, { details: QueueDetailsResponse; timestamp: string }> = {};

function secondsPassed(utcTimestamp: string, seconds: number): boolean {
    // Convert the given UTC timestamp to a JavaScript Date object
    const previousDate = new Date(utcTimestamp);

    // Get the current date in UTC
    const currentDate = new Date();

    // Calculate the difference in seconds
    const differenceInSeconds = (currentDate.getTime() - previousDate.getTime()) / 1000;

    // Return true if at least {seconds} have passed, false otherwise
    return differenceInSeconds >= seconds;
}

const fetchQueueDetailsOrGetFromCache = async (queueName: string) => {
    if (queueCache[queueName] && !secondsPassed(queueCache[queueName].timestamp, 3)) {
        // Calculate totalSent assuming currentRate is persistent and no messages failed
        const timeElapsedInSeconds =
            (new Date().getTime() - new Date(queueCache[queueName].timestamp).getTime()) / 1000;
        const additionalSent = timeElapsedInSeconds * queueCache[queueName].details.queueDetails.rate.msgPerSecond;

        // Update totalSent in the cache
        queueCache[queueName].details.stats.totalSent += additionalSent;

        return queueCache[queueName].details;
    }

    const detailsResponse = await queue.getQueueDetails(queueName).execute();

    queueCache[queueName] = {
        details: detailsResponse,
        timestamp: new Date().toISOString(),
    };

    return detailsResponse;
};

export const onQueueMessage = async (queueName, message: Message) => {
    const mainQueueDetailsResponse = await fetchQueueDetailsOrGetFromCache(MAIN_QUEUE_NAME);

    const {
        stats: { totalEnqueue: mainQueueSize },
        queueDetails: {
            rate: { msgPerSecond: mainQueueRPS },
        },
    } = mainQueueDetailsResponse;

    const mainQueueIsOverflown = mainQueueSize >= 60 * mainQueueRPS;
    const mainQueueIsDrying = mainQueueSize < 30 * mainQueueRPS;

    if (mainQueueIsOverflown) {
        await queue
            .updateQueue(queueName, {
                maxInflight: 1,
                msgPerSecond: 1,
            })
            .execute();
    } else if (mainQueueIsDrying) {
        await queue.updateQueue(queueName, {
            maxInflight: 1,
            msgPerSecond: mainQueueRPS,
        });
    }

    await queue.enqueueSingle(MAIN_QUEUE_NAME, message).execute();

    // Update the emount of enqued messages in cache
    mainQueueDetailsResponse.stats.totalEnqueue += 1;
};

export const createMainQueueIfNotExists = async () => {
    const key = "isMainQueueCreated";
    const isMainQueueCreated = await state.get(key);

    if (!isMainQueueCreated) {
        try {
            await queue
                .createQueue(MAIN_QUEUE_NAME, "api/webhooks/onMessage", {
                    maxInflight: 5,
                    msgPerSecond: 30,
                    active: true,
                })
                .execute();
        } catch (err) {
            if (err.response.status === 409) {
                console.log("CreateMainQueue: already exists, skip");
                await state.set(key, true);
            } else {
                throw err;
            }
        }
    } else {
        console.log("Main queue already exists");
    }
};
