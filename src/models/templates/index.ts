import { generateUniqueId } from "src/utils/index";
import { IAddTemplateParams, ITemplate } from "./interfaces";
import { localDeleteTemplate, localGetTemplate, localGetTemplates, localSaveTemplate } from "./local";
import { remoteAddTemplate, remoteDeleteTemplate } from "./remote";

export const addTemplate = async (params: IAddTemplateParams) => {
    const t = { ...params, id: generateUniqueId() }

    await remoteAddTemplate(t);
    await localSaveTemplate(t);
}

export const getTemplates = async () => {
    return await localGetTemplates();
}

export const deleteTemplate = async (id: string) => {
    await remoteDeleteTemplate(parseInt(id));
    await localDeleteTemplate(id);
}

export const getTemplate = async (id: string) => {
    return await localGetTemplate(id);
}

export const updateTemplate = async (t: ITemplate) => {
    await remoteAddTemplate(t);
    await localSaveTemplate(t);
}