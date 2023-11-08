const Joi = require('joi');

const RoomPayloadSchema = Joi.object({
  type: Joi.string().required(),
  maxPeople: Joi.string().required(),
  price: Joi.number().integer().options({ convert: false }).required(),
  quantity: Joi.number().integer().options({ convert: false }).required(),
});

module.exports = { RoomPayloadSchema };
