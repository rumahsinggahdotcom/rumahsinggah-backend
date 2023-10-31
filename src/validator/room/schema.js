const Joi = require('joi');

const RoomPayloadSchema = Joi.object({
  type: Joi.string().required(),
  max_people: Joi.string().required(),
  price: Joi.integer().required(),
  quantity: Joi.integer().required(),
});

module.exports = { RoomPayloadSchema };
