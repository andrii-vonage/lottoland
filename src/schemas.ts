import Joi from 'joi';

export const addTemplateBodySchema = Joi.object({
  name: Joi.string().required(),
  smsText: Joi.string().required(),
  senderIdFieldName: Joi.string().required().regex(/^[A-Za-z0-9]+$/).max(11).messages({
    'string.pattern.base': 'should contain only letters and numbers',
    'string.max': 'senderIdFieldName should be no more than 11 characters'
  }),
});

export const updateTemplateBodySchema = Joi.object({
  name: Joi.string().required(),
  smsText: Joi.string().required(),
  senderIdFieldName: Joi.string().required().regex(/^[A-Za-z0-9]+$/).max(11).messages({
    'string.pattern.base': 'should contain only letters and numbers',
    'string.max': 'senderIdFieldName should be no more than 11 characters'
  }),
  id: Joi.number().required(),
});

export const updateQueueBodySchema = Joi.object({
  maxInflight: Joi.number().required(),
  msgPerSecond: Joi.number().required(),
});

export const callbackMessageSchema = Joi.object({
  number: Joi.string().required(),
  text: Joi.string().required(),
});

export const onCampaignBodySchema = Joi.object({
  EventTypeID: Joi.number().required(),
  TimeStamp: Joi.string().required(),
  CampaignID: Joi.number().required(),
});