const Joi = require('joi');

const RoomsPayloadSchema = Joi.object({
  type: Joi.string().required(),
  maxPeople: Joi.number().integer().options({ convert: false }).required(),
  price: Joi.number().integer().options({ convert: false }).required(),
  quantity: Joi.number().integer().options({ convert: false }).required(),
});

const ImageRoomsPayloadSchema = Joi.object({
  'content-type': Joi.string().valid('image/apng', 'image/afiv', 'image/gif', 'image/jpeg', 'image/png', 'image/webp'),
}).unknown();

module.exports = { RoomsPayloadSchema, ImageRoomsPayloadSchema };
