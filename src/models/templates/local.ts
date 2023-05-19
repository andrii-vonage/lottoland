import { STATE_TABLE, state } from "../state";
import { Template } from "./index";

export const localGetTemplates = async () => {
    const templates = await state.hvals(STATE_TABLE.TEMPLATES);
    const r = [];
    for (const template of templates) {
        r.push(JSON.parse(template));
    }
    return r;
};

export const localGetTemplate = async (templateId: string): Promise<Template> => {
    const t = await state.hget(STATE_TABLE.TEMPLATES, templateId);
    return JSON.parse(t) as Template;
};

export const localSaveTemplate = async (template: Template) => {
    await state.hset(STATE_TABLE.TEMPLATES, { [template.id]: JSON.stringify(template) });
};

export const localDeleteTemplate = async (templateId: string) => {
    await state.hdel(STATE_TABLE.TEMPLATES, templateId);
};
