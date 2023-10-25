const { OwnersPayloadSchema, OwnersPasswordPayloadSchema } = require('./schema');
const InvariantError = require('../../exceptions/InvariantError');

const OwnersValidator = {
  validateOwnerPayload: (payload) => {
    const validationResult = OwnersPayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },

  validateOwnerPasswordPayload: (payload) => {
    const validationResult = OwnersPasswordPayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = OwnersValidator;
