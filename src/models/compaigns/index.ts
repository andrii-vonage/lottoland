import apiClient from "src/utils/apiClient";
import { CHANNELS } from "src/models/constants";
import { neru } from 'neru-alpha';
import state from "src/models/state";
import { ICampaign } from "./interfaces";

const BASE_URL = new URL('/current/integrations', process.env.API_BASE_URL).href
const appURL = neru.getAppUrl();

const CAMPAIGN_KEY = 'campaigns';


export const registerEventListener = async (callback: string) => {
    const url = new URL("/current/general/RegisterEventListener", BASE_URL).href
    const method = 'POST';
    const REALTIME_COMPAIGN = 1;
    const body = JSON.stringify({
        "EventTypeID": REALTIME_COMPAIGN,
        "ChannelID": CHANNELS.SMS,
        "ListenerURL": new URL(callback, appURL).href,
    });
    await apiClient(url, { method, body });
}

export const addCompaign = async (campaign: ICampaign) => {
    await state.hset(CAMPAIGN_KEY, { [campaign.id]: JSON.stringify(campaign) });
}
