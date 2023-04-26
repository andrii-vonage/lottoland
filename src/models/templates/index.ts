import { generateUniqueId } from "src/utils/index";
import { IAddTemplateParams, IGetTemplatesParams, ITemplate } from "./interfaces";
import { localDeleteTemplate, localGetTemplate, localGetTemplates, localSaveTemplate } from "./local";
import { remoteAddTemplate, remoteDeleteTemplate } from "./remote";
import { SORT_BY } from "../constants";

export const addTemplate = async (params: IAddTemplateParams) => {
    const t = { ...params, id: generateUniqueId() }

    await remoteAddTemplate(t);
    await localSaveTemplate(t);
}

export const getTemplates = async (params: IGetTemplatesParams) => {
    const data = await localGetTemplates();
    const { name, offset, limit, sortBy, sortDir } = params;

    let filteredData = data;

    if (name) {
        filteredData = filteredData.filter((item) =>
            item.name.toLowerCase().includes((name as string).toLowerCase())
        );
    }

    // Sort data
    if (sortBy && sortDir) {
        const field = sortBy as keyof ITemplate;
        const direction = (sortDir as string).toLowerCase() === SORT_BY.ASC ? 1 : -1;
        filteredData = filteredData.sort((a, b) =>
            a[field] > b[field] ? direction : -direction
        );
    }

    const offsetInt = offset || 0;
    const limitInt = limit || filteredData.length;
    const result = filteredData.slice(offsetInt, offsetInt + limitInt);

    return {
        result,
        total: filteredData.length,
    }
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