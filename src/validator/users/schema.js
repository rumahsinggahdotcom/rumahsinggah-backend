const Joi = require('joi');

const UsersPayloadSchema = Joi.object({
  fullname: Joi.string().required(),
  username: Joi.string().regex(/^\S+$/).required(),
  password: Joi.string().regex(/(?=.*[a-z])[A-Za-z\d$@$!%*?&.]{8,20}/)
    .required()
    .min(8)
    .max(20),
  phoneNumber: Joi.string().pattern(/^\d+$/)
    .min(8)
    .max(13)
    .required(),
  address: Joi.string().required(),
  gender: Joi.string().valid('Perempuan', 'Laki-Laki'),
});

const EditUsersPayloadSchema = Joi.object({
  fullname: Joi.string().required(),
  phoneNumber: Joi.string().pattern(/^\d+$/)
    .min(8)
    .max(13)
    .required(),
  address: Joi.string().required(),
  gender: Joi.string().valid('Perempuan', 'Laki-Laki'),
});

const UsersPasswordPayloadSchema = Joi.object({
  oldPassword: Joi.string().regex(/(?=.*[a-z])[A-Za-z\d$@$!%*?&.]{8,20}/)
    .required()
    .min(8)
    .max(20),
  newPassword: Joi.string().regex(/(?=.*[a-z])[A-Za-z\d$@$!%*?&.]{8,20}/)
    .required()
    .min(8)
    .max(20),
});

module.exports = { UsersPayloadSchema, EditUsersPayloadSchema, UsersPasswordPayloadSchema };
