
import apiClient from 'src/pages/utils/apiClient';
import state from '../state';
import { ITemplate } from './ITemplate.js';

const CHANNEL_ID = 505;
const BASE_URL = new URL('/current/integrations', process.env.API_BASE_URL).href

export const getTemplates = async () => {
    const templates = await state.hvals('templates');
    const r = [];
    for (const template of templates) {
        r.push(JSON.parse(template));
    }
    return r;
}

const getTemplate = async (templateId: string) => {
    const t = await state.hget('templates', templateId);
    return JSON.parse(t);
}

const saveTemplate = async (template: ITemplate) => {
    await state.hset('templates', { [template.id]: JSON.stringify(template) });
}

const deleteTemplate = async (templateId: string) => {
    await state.hdel('templates', templateId);
}

export const addTemplateAPI = async (template: ITemplate) => {
    const url = `${BASE_URL}/AddChannelTemplates?ChannelID=${CHANNEL_ID}`;
    const payload = [{
        "TemplateID": template.id,
        "TemplateName": template.name,
    }];

    await apiClient(url, { method: "POST", body: JSON.stringify(payload) });
    await saveTemplate(template);
}

export const getTemplatesAPI = async () => {
    const url = `${BASE_URL}/GetChannelTemplates?ChannelID=${CHANNEL_ID}`;
    const templates = await apiClient(url, { method: "GET" });

    const rtemplates = await getTemplates();

    return templates;

    // TODO: MAP templates response to fetch templates from Redis and return them   
}

export const getTemplateDetailsAPI = async (templateId: string) => {
    const url = `${BASE_URL}/GetChannelTemplates?ChannelID=${CHANNEL_ID}&TemplateID=${templateId}`;
    const t = await apiClient(url, { method: "GET" });
    return t;
}

export const deleteTemplateAPI = async (templateId: string) => {
    const url = `${BASE_URL}/DeleteChannelTemplates`;
    const payload = [{
        "TemplateID": parseInt(templateId),
        "ChannelID": CHANNEL_ID,
    }];

    await apiClient(url, { method: "POST", body: JSON.stringify(payload) });
    await deleteTemplate(templateId);
}