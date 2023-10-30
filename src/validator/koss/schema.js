const Joi = require('joi');

const KosPayloadSchema = Joi.object({
  name: Joi.string().required(),
  address: Joi.string().required(),
  rating: Joi.number(),
});

const KosImageSchema = Joi.object({
  'content-type': Joi.string().valid('image/apng', 'image/afiv', 'image/gif', 'image/jpeg', 'image/png', 'image/webp'),
}).unknown();

const RoomSchema = Joi.object({
  type: Joi.string().required(),
  max_people: Joi.string().required(),
  price: Joi.integer().required(),
  quantity: Joi.integer().required(),
});

const RoomNumSchema = Joi.object({
  number: Joi.integer().required(),
  status: Joi.string().required(),
});

module.exports = {
  KosPayloadSchema, KosImageSchema, RoomSchema, RoomNumSchema,
};
