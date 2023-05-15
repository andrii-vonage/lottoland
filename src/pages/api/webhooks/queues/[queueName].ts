import type { NextApiRequest, NextApiResponse } from 'next'
import { neru, Queue, QueueDetailsResponse } from 'neru-alpha';
import { MAIN_QUEUE_NAME } from '../../../../config';

const session = neru.getGlobalSession();
const queueAPI = new Queue(session);

const queueCache: Record<string, { details: QueueDetailsResponse, timestamp: string }> = {}

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

const getQueueDetails = async (queueName: string) => {
    if (queueCache[queueName] && !secondsPassed(queueCache[queueName].timestamp, 3)) {
        // Calculate totalSent assuming currentRate is persistent and no messages failed
        const timeElapsedInSeconds = (new Date().getTime() - new Date(queueCache[queueName].timestamp).getTime()) / 1000;
        const additionalSent = timeElapsedInSeconds * queueCache[queueName].details.queueDetails.rate.msgPerSecond;
        
        // Update totalSent in the cache
        queueCache[queueName].details.stats.totalSent += additionalSent;
        
        return queueCache[queueName].details;
    }

    const detailsResponse = await queueAPI.getQueueDetails(queueName).execute();

    queueCache[queueName] = {
        details: detailsResponse,
        timestamp: new Date().toISOString()
    };

    return detailsResponse;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { method, body } = req;

    switch (method) {
        case 'POST':
            const incomingQueueName = req.query.queueName as string;
            const mainQueueDetailsResponse = await getQueueDetails(MAIN_QUEUE_NAME);

            const {
                stats: {
                    totalSent, totalEnqueue
                },
                queueDetails: {
                    rate: {
                        msgPerSecond: mainQueueRPS
                    }
                }
            } = mainQueueDetailsResponse;

            const mainQueueSize = totalEnqueue - totalSent;
            const mainQueueIsOverflown = mainQueueSize > 60 * mainQueueRPS;
            const mainQueueIsDrying = mainQueueSize < 30 * mainQueueRPS;

            if (mainQueueIsOverflown) {
                await queueAPI.updateQueue(incomingQueueName, {
                    maxInflight: 1,
                    msgPerSecond: 1
                }).execute();
            } else if (mainQueueIsDrying) {
                await queueAPI.updateQueue(incomingQueueName, {
                    maxInflight: 1,
                    msgPerSecond: mainQueueRPS
                });
            }

            await queueAPI.enqueueSingle(MAIN_QUEUE_NAME, body).execute();

            // Update the emount of enqued messages in cache
            mainQueueDetailsResponse.stats.totalEnqueue += 1;

            res.status(200).send('OK');
            break;
        default:
            res.setHeader('Allow', ['POST'])
            res.status(405).end(`Method ${method} Not Allowed`)
    }
}