const Joi = require('joi');

const ReviewSchemaPayload = Joi.object({
  userId: Joi.string().required(),
  kosId: Joi.string().required(),
  score: Joi.number().integer().options({ convert: false }).required(),
  review: Joi.string.required(),
});

module.exports = { ReviewSchemaPayload };
