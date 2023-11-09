const Joi = require('joi');

const RoomPayloadSchema = Joi.object({
  type: Joi.string().required(),
  maxPeople: Joi.string().required(),
  price: Joi.number().integer().options({ convert: false }).required(),
  quantity: Joi.number().integer().options({ convert: false }).required(),
});

const ImageRoomPayloadSchema = Joi.object({
  'content-type': Joi.string().valid('image/apng', 'image/afiv', 'image/gif', 'image/jpeg', 'image/png', 'image/webp'),
}).unknown();

module.exports = { RoomPayloadSchema, ImageRoomPayloadSchema };
