const Joi = require('joi');

const OwnersPayloadSchema = Joi.object({
  fullname: Joi.string().required(),
  username: Joi.string().required(),
  password: Joi.string().required(),
  address: Joi.string().required(),
  gender: Joi.string().valid('Laki-Laki', 'Perempuan'),
  phoneNumber: Joi.string().required(),
});

module.exports = { OwnersPayloadSchema };
