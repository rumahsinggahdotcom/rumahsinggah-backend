const Joi = require('joi');

const PostAuthSchemaPayload = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().regex(/(?=.*[a-z])[A-Za-z\d$@$!%*?&.]{8,20}/)
    .required()
    .min(8)
    .max(20),
});

const PutAuthSchemaPayload = Joi.object({
  refreshToken: Joi.string().required(),
});

const DeleteAuthSchemaPayload = Joi.object({
  refreshToken: Joi.string().required(),
});

module.exports = {
  PostAuthSchemaPayload,
  PutAuthSchemaPayload,
  DeleteAuthSchemaPayload,
};
