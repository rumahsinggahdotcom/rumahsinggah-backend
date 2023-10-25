const Joi = require('joi');

const UsersPayloadSchema = Joi.object({
  fullname: Joi.string().required(),
  username: Joi.string().required(),
  password: Joi.string().required(),
  phoneNumber: Joi.string().required(),
  address: Joi.string().required(),
  gender: Joi.string().valid('Perempuan', 'Laki-Laki'),
});

module.exports = { UsersPayloadSchema };
