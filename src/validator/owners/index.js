const { OwnerPayloadSchema } = require('./schema');
const InvariantError = require('../../exceptions/InvariantError');

const OwnersValidator = {
  validateOwnerPayload: (payload) => {
    const validationResult = OwnerPayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

exports.module = OwnersValidator;
