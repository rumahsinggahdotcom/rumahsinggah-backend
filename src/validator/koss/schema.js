const Joi = require('joi');

const KosPayloadSchema = Joi.object({
  name: Joi.string().required(),
  address: Joi.string().required(),
  description: Joi.string().required(),
  rating: Joi.number(),
});

const KosImagePayloadSchema = Joi.object({
  'content-type': Joi.string().valid('image/apng', 'image/afiv', 'image/gif', 'image/jpeg', 'image/png', 'image/webp'),
}).unknown();

module.exports = {
  KosPayloadSchema, KosImagePayloadSchema,
};
