import { assets } from "./assets";
import { state, STATE_TABLE } from "./state";

export enum OptInOutAction {
    OPT_IN = "opt-in",
    OPT_OUT = "opt-out",
}

export interface OptInOutBody {
    action: OptInOutAction;
    phoneNumber: string;
    phoneCountryCode: string;
}

export const optIn = async (phoneNumber: string) => {
    await state.hset(STATE_TABLE.NUMBERS, {
        [phoneNumber]: "{}",
    });
};

export const optOut = async (phoneNumber: string) => {
    await state.hdel(STATE_TABLE.NUMBERS, phoneNumber);
};

export const getOptedOutNumbers = async () => {
    // get all numbers as an array
    return await state.hgetall(STATE_TABLE.NUMBERS);
};

export const saveNumbersToAssets = async () => {
    const optedOutNumbers = await getOptedOutNumbers();

    await assets.uploadData([JSON.stringify(optedOutNumbers)], "numbers", ["opted-out-numbers.json"]).execute();
};
