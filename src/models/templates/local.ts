import state from 'src/models/state';
import { ITemplate } from './interfaces';

const TEMPLATE_KEY = 'templates';

export const localGetTemplates = async () => {
    const templates = await state.hvals(TEMPLATE_KEY);
    const r = [];
    for (const template of templates) {
        r.push(JSON.parse(template));
    }
    return r;
}

export const localGetTemplate = async (templateId: string) => {
    const t = await state.hget(TEMPLATE_KEY, templateId);
    return JSON.parse(t);
}

export const localSaveTemplate = async (template: ITemplate) => {
    await state.hset(TEMPLATE_KEY, { [template.id]: JSON.stringify(template) });
}

export const localDeleteTemplate = async (templateId: string) => {
    await state.hdel(TEMPLATE_KEY, templateId);
}