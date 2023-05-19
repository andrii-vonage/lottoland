import { SORT_BY } from "../../config";
import { localDeleteTemplate, localGetTemplate, localGetTemplates, localSaveTemplate } from "./local";
import { remoteAddTemplate, remoteDeleteTemplate } from "./remote";
import { generateUniqueId } from "../../utils";

export interface GetTemplatesParams {
    name?: string;
    offset?: number;
    limit?: number;
    sortBy?: string;
    sortDir?: SORT_BY;
}

export class Template {
    id: number;
    name: string;
    smsText: string;
    senderIdFieldName: string;
    optOutUrl: string;

    constructor(name: string, smsText: string, senderIdFieldName: string, optOutUrl: string) {
        this.id = generateUniqueId();
        this.name = name;
        this.smsText = smsText;
        this.senderIdFieldName = senderIdFieldName;
        this.optOutUrl = optOutUrl;
    }
}

export const addTemplate = async (template: Template) => {
    await remoteAddTemplate(template);
    await localSaveTemplate(template);
};

export const getTemplates = async (params: GetTemplatesParams) => {
    const data = await localGetTemplates();
    const { name, offset, limit, sortBy, sortDir } = params;

    let filteredData = data;

    if (name) {
        filteredData = filteredData.filter((item) => item.name.toLowerCase().includes((name as string).toLowerCase()));
    }

    // Sort data
    if (sortBy && sortDir) {
        const field = sortBy as keyof Template;
        const direction = (sortDir as string).toLowerCase() === SORT_BY.ASC ? 1 : -1;
        filteredData = filteredData.sort((a, b) => (a[field] > b[field] ? direction : -direction));
    }

    const offsetInt = offset || 0;
    const limitInt = limit || filteredData.length;
    const result = filteredData.slice(offsetInt, offsetInt + limitInt);

    return {
        result,
        total: filteredData.length,
    };
};

export const deleteTemplate = async (id: string) => {
    await remoteDeleteTemplate(parseInt(id));
    await localDeleteTemplate(id);
};

export const getTemplate = async (id: string): Promise<Template> => {
    return await localGetTemplate(id);
};

export const updateTemplate = async (t: Template) => {
    await remoteAddTemplate(t);
    await localSaveTemplate(t);
};

// Attributes that consists of two and more words should have no spaces, e.g. Allow SMS -> AllowSMS
export const getTemplateAttributes = (templates: Template[]): string[] => {
    // extract attributes from {{attribute}}
    return [
        "MobilePhone",
        ...new Set(
            templates.flatMap(({ smsText }) =>
                (smsText.match(/{{\s*(.*?)\s*}}/g) || []).map((val) => val.replace(/{{|}}/g, "").trim())
            )
        ),
    ];
};
