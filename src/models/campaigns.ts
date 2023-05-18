import { STATE_TABLE, state } from "./state";
import { Campaign } from "./campaign";
import { SORT_BY } from "../config";

export const deleteCampaigns = async () => {
    await state.delete(STATE_TABLE.CAMPAIGNS);
};

export interface GetTCampaignsParams {
    id?: number;
    targetGroupName?: string;
    offset?: number;
    limit?: number;
    sortBy?: string;
    sortDir?: SORT_BY;
}

export const getCampaigns = async (params: GetTCampaignsParams) => {
    const c: string[] = await state.hvals(STATE_TABLE.CAMPAIGNS);

    const campaigns: Campaign[] = [];

    for (const campaign of c) {
        campaigns.push(JSON.parse(campaign));
    }

    let filteredData = campaigns;

    const { id, targetGroupName, offset, limit, sortBy, sortDir } = params;

    if (targetGroupName) {
        filteredData = filteredData.filter((item) =>
            item.targetGroupName.toLowerCase().includes((targetGroupName as string).toLowerCase())
        );
    }

    if (id) {
        filteredData = filteredData.filter((item) => item.id === id);
    }

    // Sort data
    if (sortBy && sortDir) {
        const field = sortBy as keyof Campaign;
        const direction = (sortDir as string).toLowerCase() === SORT_BY.ASC ? 1 : -1;
        filteredData = filteredData.sort((a, b) => (a[field] > b[field] ? direction : -direction));
    }

    const offsetInt = offset || 0;
    const limitInt = limit || filteredData.length;
    const result = filteredData.slice(offsetInt, offsetInt + limitInt);

    return {
        result,
        total: filteredData.length,
    };
};
