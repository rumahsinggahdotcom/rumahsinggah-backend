const InvariantError = require('../../exceptions/InvariantError');
const { KosPayloadSchema, KosImagePayloadSchema } = require('./schema');

const KossValidator = {
  validateKosPayload: (payload) => {
    const kosValidationResult = KosPayloadSchema.validate(payload);

    if (!kosValidationResult) {
      throw new InvariantError(kosValidationResult.error.message);
    }
  },

  validateImageKosPayload: (payload) => {
    const imageKosValidationResult = KosImagePayloadSchema.validate(payload);

    if (!imageKosValidationResult) {
      throw new InvariantError(imageKosValidationResult.error.message);
    }
  },
};

module.exports = KossValidator;
