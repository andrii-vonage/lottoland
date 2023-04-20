import { CHANNELS, SORT_BY } from "../constants";

export interface ITemplate {
    id: number;
    name: string;
    smsText: string,
    senderIdFieldName: string
}

export interface IAddTemplateParams {
    name: string;
    smsText: string,
    senderIdFieldName: string
}

export interface IDeleteTemplatePayload {
    TemplateID: number,
    ChannelID: CHANNELS,
}

export interface IAddTemplatePayload {
    TemplateID: number,
    TemplateName: string,
}

export interface IGetTemplatesParams {
    name?: string,
    offset?: number,
    limit?: number,
    sortBy?: string,
    sortDir?: SORT_BY,
}

