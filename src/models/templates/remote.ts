import apiClient from 'src/utils/apiClient';
import { IAddTemplatePayload, IDeleteTemplatePayload, ITemplate } from './interfaces';
import { CHANNELS, OPTIMOVE_ENDPOINTS } from 'src/models/constants';

const API_BASE_URL = process.env.API_BASE_URL;


export const remoteAddTemplate = async (template: ITemplate) => {
    const urlObj = new URL(OPTIMOVE_ENDPOINTS.ADD_CHANNEL_TEMPLATES, API_BASE_URL);
    const query = new URLSearchParams();
    query.append('ChannelID', CHANNELS.SMS.toString());
    urlObj.search = query.toString();

    const url = urlObj.href;

    const payload: IAddTemplatePayload[] = [{
        TemplateID: template.id,
        TemplateName: template.name,
    }];

    const method = "POST";
    const body = JSON.stringify(payload);

    await apiClient(url, { method, body });
}

export const remoteDeleteTemplate = async (id: number) => {
    const url = new URL(OPTIMOVE_ENDPOINTS.DELETE_CHANNEL_TEMPLATES, API_BASE_URL).href;

    const payload: IDeleteTemplatePayload[] = [{
        TemplateID: id,
        ChannelID: CHANNELS.SMS,
    }];

    const method = "POST";
    const body = JSON.stringify(payload);

    await apiClient(url, { method, body });
}