const { UsersPayloadSchema, EditUsersPayloadSchema } = require('./schema');
const InvariantError = require('../../exceptions/InvariantError');

const UsersValidator = {
  validateUserPayload: (payload) => {
    const validationResult = UsersPayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },

  validateEditUserPayload: (payload) => {
    const validationResult = EditUsersPayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};
module.exports = UsersValidator;
