export const PAGE_SIZE = 10;

export const API_BASE_URL = process.env.API_BASE_URL;

export enum REQUEST_VERB {
    GET = 'GET',
    POST = 'POST',
    PUT = 'PUT',
    DELETE = 'DELETE'
}

export enum CAMPAIGN_CHANNEL {
    SMS = 505,
}

export enum SORT_BY {
    ASC = 'asc',
    DESC = 'desc',
}

export enum EVENT_TYPE {
    REALTIME = 1
}

export enum APP_CALLBACK_ENDPOINT {
    ON_MESSAGE_EVENT = 'api/webhooks/onMessageEvent',

}

export enum OPTIMOVE_ENDPOINT {
    ADD_CHANNEL_TEMPLATES = '/current/integrations/AddChannelTemplates',
    DELETE_CHANNEL_TEMPLATES = '/current/integrations/DeleteChannelTemplates',
    REGISTER_EVENT_LISTENER = 'current/general/RegisterEventListener',
    GET_CUSTOMER_SEND_DETAILS_BY_CHANNEL = 'current/customers/GetCustomerSendDetailsByChannel',
    UPDATE_CAMPAIGN_METRICS = 'current/integrations/UpdateCampaignMetrics',
    UPDATE_CAMPAIGN_INTEGRATIONS = 'current/integrations/UpdateCampaignInteractions',
    GET_CAMPAIGN_DETAILS = 'current/actions/GetCampaignDetails',
    GET_TARGET_GROUP_NAME = 'current/groups/GetTargetGroupName',
    GET_ACTIONS_BY_TARGET_GROUP = 'current/actions/GetActionsByTargetGroup',
    GET_ACTION_NAME = 'current/actions/GetActionName',
}

export enum OPTIMOVE_DELIVERY_STATUS {
    SENT = 0,
    DELIVERED = 1,
    OPENED = 2,
    CLICKED = 3,
    UNSUBSCRIBED = 4,
    DROPPED = 5,
    SPAM_REPORTS = 6,
    BOUNCED = 9,
}