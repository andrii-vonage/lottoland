import Joi from "joi";

export const addTemplateBodySchema = Joi.object({
    name: Joi.string().required(),
    smsText: Joi.string().required(),
    senderIdFieldName: Joi.string()
        .required()
        .regex(/^[A-Za-z0-9]+$/)
        .max(11)
        .messages({
            "string.pattern.base": "should contain only letters and numbers",
            "string.max": "senderIdFieldName should be no more than 11 characters",
        }),
    optOutUrl: Joi.string().required(),
});

export const updateTemplateBodySchema = Joi.object({
    id: Joi.number().required(),
    name: Joi.string().required(),
    smsText: Joi.string().required(),
    senderIdFieldName: Joi.string()
        .required()
        .regex(/^[A-Za-z0-9]+$/)
        .max(11)
        .messages({
            "string.pattern.base": "should contain only letters and numbers",
            "string.max": "senderIdFieldName should be no more than 11 characters",
        }),
    optOutUrl: Joi.string().required(),
});

export const updateQueueBodySchema = Joi.object({
    maxInflight: Joi.number().required(),
    msgPerSecond: Joi.number().required(),
});

export const onMessageSchema = Joi.object({
    campaignId: Joi.number().required(),
    templateId: Joi.number().required(),
    number: Joi.string().required(),
    text: Joi.string().required(),
});

export const onCampaignBodySchema = Joi.object({
    EventTypeID: Joi.number().required(),
    TimeStamp: Joi.string().required(),
    CampaignID: Joi.number().required(),
});

export const onQueueMessageBodySchema = Joi.object({
    campaignId: Joi.number().required(),
    templateId: Joi.number().required(),
    number: Joi.string().required(),
    text: Joi.string().required(),
});

export const onMessageReceiptSaveEventBodySchema = Joi.object({});

export const optInOutBodySchema = Joi.object({
    action: Joi.string().valid("opt-out", "opt-in").required(),
    phoneNumber: Joi.string().required(),
    phoneCountryCode: Joi.string()
        .pattern(/^\+\d{1,3}$/)
        .required(),
});
