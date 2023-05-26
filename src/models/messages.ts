import { neru, Messages, SMSMessage } from "neru-alpha";
import { Template } from "./templates";
import { CampaignCustomer, updateCampaignMetrics } from "./campaign";
import { state, STATE_TABLE } from "./state";
import { APP_CALLBACK_ENDPOINT, OPTIMOVE_DELIVERY_STATUS } from "../config";

const configurations = JSON.parse(process.env.NERU_CONFIGURATIONS);
const VONAGE_NUMBER = configurations["vonage-number"];

const session = neru.getGlobalSession();
export const messages = new Messages(session);

export function mapVonageSMSStatusToOptimoveStatus(status: SMS_DELIVERY_STATUS): OPTIMOVE_DELIVERY_STATUS | null {
    switch (status) {
        case SMS_DELIVERY_STATUS.ACCEPTED:
        case SMS_DELIVERY_STATUS.SUBMITTED:
        case SMS_DELIVERY_STATUS.BUFFERED:
            return OPTIMOVE_DELIVERY_STATUS.SENT;
        case SMS_DELIVERY_STATUS.DELIVERED:
            return OPTIMOVE_DELIVERY_STATUS.DELIVERED;
        case SMS_DELIVERY_STATUS.EXPIRED:
        case SMS_DELIVERY_STATUS.FAILED:
        case SMS_DELIVERY_STATUS.REJECTED:
        case SMS_DELIVERY_STATUS.UNKNOWN:
            return OPTIMOVE_DELIVERY_STATUS.DROPPED;
        default:
            throw new Error(`Unknown status: ${status}`);
    }
}

export interface Message {
    campaignId: number;
    templateId: number;
    number: string;
    text: string;
}

export enum SMS_DELIVERY_STATUS {
    SUBMITTED = "submitted",
    ACCEPTED = "accepted",
    DELIVERED = "delivered",
    BUFFERED = "buffered",
    EXPIRED = "expired",
    FAILED = "failed",
    REJECTED = "rejected",
    UNKNOWN = "unknown",
}

function fillTemplate(template: string, dictionary: Record<string, string>) {
    return template.replace(/{{\s*(.*?)\s*}}/g, function (_, key) {
        return dictionary[key.trim()] || "";
    });
}

export const createSMSMessages = (
    campaignId: number,
    customers: CampaignCustomer[],
    templates: Template[],
    templatePlaceholders: string[]
) => {
    return customers.map((customer) => {
        const attrList = customer.CustomerAttributes;
        const attrDict: Record<string, string> = {};

        for (let i = 0; i < templatePlaceholders.length; i++) {
            attrDict[templatePlaceholders[i]] = attrList[i];
        }

        const template = templates.find((t) => (t.id = customer.TemplateID));
        const number = attrDict["MobilePhone"];
        const text = fillTemplate(template.smsText, attrDict);

        return {
            campaignId,
            templateId: customer.TemplateID,
            number,
            text,
        };
    });
};

export const onMessage = async (message: Message): Promise<void> => {
    const isOptedOut = await state.hget(STATE_TABLE.NUMBERS, "+" + message.number);

    if (isOptedOut) {
        console.log(`Number ${message.number} is opted out, skip`);
        return;
    }

    const sms = new SMSMessage();
    sms.text = message.text;
    sms.to = message.number;
    sms.from = VONAGE_NUMBER;

    const { message_uuid }: { message_uuid: string } = await messages.send(sms).execute();

    await state.hset(message_uuid, {
        campaignId: JSON.stringify(message.campaignId),
        templateId: JSON.stringify(message.templateId),
    });
};

export const onMessageEvent = async (message: any): Promise<void> => {
    const uuid = message.message_uuid;
    const status = message.status as SMS_DELIVERY_STATUS;

    const data = await state.hgetall(uuid);
    const templateId = parseInt(data.templateId);
    const campaignId = parseInt(data.campaignId);

    const optimoveStatus = mapVonageSMSStatusToOptimoveStatus(status);
    console.log(`SMS status: ${status} -> Optimove status: ${optimoveStatus}`);

    const result = await updateCampaignMetrics(campaignId, templateId, [
        {
            id: optimoveStatus,
            value: 1,
        },
    ]);

    console.log("UpdateCampaignMetrics:", result);
};

export const createOnMessageEventListenerIfNotExist = async () => {
    const key = "onMessageEventRegistered";
    const isRegistered = await state.get(key);

    if (!isRegistered) {
        try {
            await messages
                .onMessageEvents(
                    APP_CALLBACK_ENDPOINT.ON_MESSAGE_EVENT,
                    {
                        type: "sms",
                        number: VONAGE_NUMBER,
                    },
                    {
                        type: "sms",
                        number: null,
                    }
                )
                .execute();
        } catch (err) {
            throw new Error("CreateOnMessageEventListener:" + err.message);
        }
    } else {
        console.log("CreateOnMessageEventListener: already created a listener, skip");
    }
};
