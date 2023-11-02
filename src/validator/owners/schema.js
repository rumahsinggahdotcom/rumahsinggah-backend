const Joi = require('joi');

const OwnersPayloadSchema = Joi.object({
  fullname: Joi.string().required(),
  username: Joi.string().regex(/^\S+$/).required(),
  password: Joi.string().regex(/(?=.*[a-z])[A-Za-z\d$@$!%*?&.]{8,20}/)
    .required()
    .min(8)
    .max(20),
  address: Joi.string().required(),
  gender: Joi.string().valid('Laki-Laki', 'Perempuan'),
  phoneNumber: Joi.string().pattern(/^\d+$/)
    .min(8)
    .max(13)
    .required(),
});

const OwnersPasswordPayloadSchema = Joi.object({
  oldPassword: Joi.string().required(),
  newPassword: Joi.string().regex(/(?=.*[a-z])[A-Za-z\d$@$!%*?&.]{8,20}/)
    .required()
    .min(8)
    .max(20),
});

module.exports = { OwnersPayloadSchema, OwnersPasswordPayloadSchema };
