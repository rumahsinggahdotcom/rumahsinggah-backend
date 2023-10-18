const Joi = require('joi');

const UsersPayloadSchema = Joi.object({
  nama_lengkap: Joi.string().required(),
  username: Joi.string().required(),
  password: Joi.string().required(),
  phone_number: Joi.string().required(),
  address: Joi.string().required(),
  option: Joi.string().valid('Perempuan', 'Laki-Laki'),
});

module.exports = { UsersPayloadSchema };
