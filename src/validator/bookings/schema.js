const Joi = require('joi');

const BookingsPayloadSchema = Joi.object({
  start: Joi.date().required(),
  end: Joi.date().required(),
  status: Joi.string().required(),
  totalPrice: Joi.number().integer().options({ convert: false }).required(),
});

module.exports = { BookingsPayloadSchema };
