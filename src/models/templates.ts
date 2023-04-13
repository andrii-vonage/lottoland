import state from './state';

export interface Template {
    id: string;
    smsText: string;
    senderIdFieldName: string;
}

export const getTemplates = async () => {
    const templates = await state.hvals('templates');
    const r = [];
    for (const template of templates) {
        r.push(JSON.parse(template));
    }
    return r;
}

export const getTemplate = async (templateId: string) => {
    const t = await state.hget('templates', templateId);
    return JSON.parse(t);
}

export const saveTemplate = async (template: Template) => {
    await state.hset('templates', { [template.id]: JSON.stringify(template) });
}

export const deleteTemplate = async (templateId: string) => {
    await state.hdel('templates', templateId);
}