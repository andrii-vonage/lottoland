import { neru } from "neru-alpha";
import { API_BASE_URL, CAMPAIGN_CHANNEL, EVENT_TYPE, OPTIMOVE_ENDPOINT, REQUEST_VERB } from "../config";
import path from "path";
import { apiClient } from "../apiClient";
import { state } from "./state";

const APP_URL = neru.getAppUrl();

export class OnCampaignListenerPayload {
    EventTypeID: EVENT_TYPE;
    ChannelID: CAMPAIGN_CHANNEL.SMS;
    ListenerURL: string;

    constructor(callbackUrl: string) {
        this.EventTypeID = EVENT_TYPE.REALTIME;
        this.ChannelID = CAMPAIGN_CHANNEL.SMS;
        this.ListenerURL = callbackUrl;
    }
}

const createOnCampaignListener = async (callback: string): Promise<void> => {
    const url = new URL(OPTIMOVE_ENDPOINT.REGISTER_EVENT_LISTENER, API_BASE_URL).href;
    const baseURL = new URL(APP_URL);
    const callbackUrl = new URL(path.join(baseURL.pathname, callback), baseURL.origin).href;
    const method = REQUEST_VERB.POST;
    const body = JSON.stringify(new OnCampaignListenerPayload(callbackUrl));

    await apiClient(url, { method, body });
};

export const createOnCampaignListenerIfNotExist = async () => {
    const key = "onCampaignListenerAdded";
    const isAdded = await state.get(key);

    if (!isAdded) {
        try {
            await createOnCampaignListener("api/webhooks/onCampaign");
            await state.set(key, true);
        } catch (err) {
            console.error(`CreateOnCampaignListener:`, err);
            throw new Error("CreateOnCampaignListener:" + err.message);
        }
    } else {
        console.log("CreateOnCampaignListener: already created a listener, skip");
    }
};
