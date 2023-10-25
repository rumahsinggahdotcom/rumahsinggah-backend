const Joi = require('joi');

const KossPayloadSchema = Joi.object({
  name: Joi.string().required(),
  address: Joi.string().required(),
  rating: Joi.float(),
  'content-type': Joi.string().valid('image/apng', 'image/afiv', 'image/gif', 'image/jpeg', 'image/png', 'image/webp').unknown(),
});

module.exports = KossPayloadSchema;
