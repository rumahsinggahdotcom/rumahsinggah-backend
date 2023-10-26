const Joi = require('joi');

const KosPayloadSchema = Joi.object({
  name: Joi.string().required(),
  address: Joi.string().required(),
  rating: Joi.float(),
});

const KosImageSchema = Joi.object({
  'content-type': Joi.string().valid('image/apng', 'image/afiv', 'image/gif', 'image/jpeg', 'image/png', 'image/webp').unknown(),
});

module.exports = { KosPayloadSchema, KosImageSchema };
