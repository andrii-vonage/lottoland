import { API_BASE_URL, OPTIMOVE_ENDPOINT, REQUEST_VERB } from "../config";
import { apiClient } from "../apiClient";

export interface CampaignDetails {
    TargetGroupID: number;
    CampaignType: string;
    Duration: number;
    LeadTime: number;
    Notes: string;
    IsMultiChannel: boolean;
    IsRecurrence: boolean;
    Status: string;
    Error: string;
    Tags: string[];
}

export const getCampaignDetails = async (id: number): Promise<CampaignDetails> => {
    const urlObject = new URL(OPTIMOVE_ENDPOINT.GET_CAMPAIGN_DETAILS, API_BASE_URL);
    urlObject.searchParams.append("CampaignID", id.toString());

    const url = urlObject.href;
    const r = await apiClient(url, { method: REQUEST_VERB.GET });

    return await r.json();
};
