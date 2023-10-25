const InvariantError = require('../../exceptions/InvariantError');
const KossPayloadSchema = require('./schema');

const KossValidator = {
  validateKossPayload: (payload) => {
    const validationResult = KossPayloadSchema.validate(payload);

    if (!validationResult) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = KossValidator;
