import { CHANNEL, OPTIMOVE_ENDPOINT, REQUEST_VERB } from '../../config';
import { Template } from '../../pages/templates';
import { apiClient } from '../../apiClient';

const API_BASE_URL = process.env.API_BASE_URL;

export const remoteAddTemplate = async (template: Template) => {
    const urlObj = new URL(OPTIMOVE_ENDPOINT.ADD_CHANNEL_TEMPLATES, API_BASE_URL);
    const query = new URLSearchParams();
    query.append('ChannelID', CHANNEL.SMS.toString());
    urlObj.search = query.toString();

    const url = urlObj.href;

    const payload = [{
        TemplateID: template.id,
        TemplateName: template.name,
    }];

    const method = REQUEST_VERB.POST;
    const body = JSON.stringify(payload);

    await apiClient(url, { method, body });
}

export const remoteDeleteTemplate = async (id: number) => {
    const url = new URL(OPTIMOVE_ENDPOINT.DELETE_CHANNEL_TEMPLATES, API_BASE_URL).href;

    const payload = [{
        TemplateID: id,
        ChannelID: CHANNEL.SMS,
    }];

    const method = REQUEST_VERB.POST;
    const body = JSON.stringify(payload);

    await apiClient(url, { method, body });
}