const InvariantError = require('../../exceptions/InvariantError');
const {
  PostAuthSchemaPayload,
  PutAuthSchemaPayload,
  DeleteAuthSchemaPayload,
} = require('./schema');

const AuthsValidator = {
  validatePostAuthPayload: (payload) => {
    const postAuthValidationResult = PostAuthSchemaPayload.validate(payload);

    if (!postAuthValidationResult) {
      throw new InvariantError(postAuthValidationResult.error.message);
    }
  },

  validatePutAuthPayload: (payload) => {
    const putAuthValidationResult = PutAuthSchemaPayload.validate(payload);

    if (!putAuthValidationResult) {
      throw new InvariantError(putAuthValidationResult.error.message);
    }
  },

  validateDeleteAuthPayload: (payload) => {
    const deleteAuthValidationResult = DeleteAuthSchemaPayload.validate(payload);

    if (!deleteAuthValidationResult) {
      throw new InvariantError(deleteAuthValidationResult.error.message);
    }
  },
};

module.exports = AuthsValidator;
