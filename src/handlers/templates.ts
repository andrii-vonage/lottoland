import {
    addTemplate,
    deleteTemplate,
    getTemplate,
    getTemplates,
    GetTemplatesParams,
    Template,
    updateTemplate,
} from "../models/templates";
import { addTemplateBodySchema, updateTemplateBodySchema } from "../schemas";
import { SORT_BY } from "../config";

export const createTemplateHandler = async (req, res) => {
    try {
        const body = req.body as Template;
        delete req.body.id;

        const { error } = addTemplateBodySchema.validate(req.body);

        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const template = new Template(body.name, body.smsText, body.senderIdFieldName);

        await addTemplate(template);

        return res.status(201).json({ result: "OK" });
    } catch (err) {
        console.error("AddTemplateHandler:", err);
        return res.status(500).json({ error: err.message });
    }
};

export const getTemplateHandler = async (req, res) => {
    try {
        const templateId = req.query.templateId as string;
        const template = await getTemplate(templateId);

        if (!template) {
            return res.status(404).json({ message: "Template not found" });
        }

        return res.status(200).json({ result: template });
    } catch (err) {
        console.error("GetTemplateHandler:", err);
        return res.status(500).json({ error: err.message });
    }
};

export const updateTemplateHandler = async (req, res) => {
    try {
        const { error } = updateTemplateBodySchema.validate(req.body);

        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        await updateTemplate(req.body);

        return res.status(200).json({ result: "OK" });
    } catch (err) {
        console.error("UpdateTemplateHandler:", err);
        return res.status(500).json({ error: err.message });
    }
};

export const deleteTemplateHandler = async (req, res) => {
    try {
        const templateId = req.query.templateId as string;
        await deleteTemplate(templateId);
        return res.status(200).json({ result: "OK" });
    } catch (err) {
        console.error("DeleteTemplateHandler:", err);
        return res.status(500).json({ error: err.message });
    }
};

export const getTemplatesHandler = async (req, res) => {
    try {
        const { name, offset, limit, sortBy, sortDir } = req.query;
        const params: GetTemplatesParams = {};

        if (name) {
            params.name = name as string;
        }

        if (offset) {
            params.offset = parseInt(offset as string);
        }

        if (limit) {
            params.limit = parseInt(limit as string);
        }

        if (sortBy) {
            params.sortBy = sortBy as keyof typeof SORT_BY;
        }

        if (sortDir) {
            params.sortDir = sortDir as SORT_BY;
        }

        const r = await getTemplates(params);
        return res.status(200).json(r);
    } catch (err) {
        console.error("GetTemplatesHandler:", err);
        return res.status(500).json({ error: err.message });
    }
};
