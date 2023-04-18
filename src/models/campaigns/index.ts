import apiClient from "src/utils/apiClient";
import { CHANNELS, OPTIMOVE_ENDPOINTS } from "src/models/constants";
import { neru } from 'neru-alpha';
import state from "src/models/state";
import { ICampaign } from "./interfaces";

const API_BASE_URL = process.env.API_BASE_URL;
const appURL = neru.getAppUrl();

const CAMPAIGN_KEY = 'campaigns';


export const registerEventListener = async (callback: string) => {
    const url = new URL(OPTIMOVE_ENDPOINTS.REGISTER_EVENT_LISTENER, API_BASE_URL).href

    const method = 'POST';
    const REALTIME_COMPAIGN = 1;
    const body = JSON.stringify({
        "EventTypeID": REALTIME_COMPAIGN,
        "ChannelID": CHANNELS.SMS,
        "ListenerURL": new URL(callback, appURL).href,
    });
    await apiClient(url, { method, body });
}

export const addCampaign = async (campaign: ICampaign) => {
    await state.hset(CAMPAIGN_KEY, { [campaign.id]: JSON.stringify(campaign) });
}

export const getCampaigns = async () => {
    const campaigns: string[] = await state.hvals(CAMPAIGN_KEY);

    const r = [];
    for (const campaign of campaigns) {
        r.push(JSON.parse(campaign));
    }
    return [{ id: 1, name: 'test'}, { id: 2, name: 'test2'}, { id: 3, name: 'test3'}, { id: 4, name: 'test4'}];
}
