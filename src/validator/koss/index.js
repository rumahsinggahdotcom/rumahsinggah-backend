const InvariantError = require('../../exceptions/InvariantError');
const { KosPayloadSchema, KosImageSchema } = require('./schema');

const KossValidator = {
  validateKosPayload: (payload) => {
    const kosValidationResult = KosPayloadSchema.validate(payload);

    if (!kosValidationResult) {
      throw new InvariantError(kosValidationResult.error.message);
    }
  },

  validateImageKosPayload: (payload) => {
    const imageKosValidationResult = KosImageSchema.validate(payload);

    if (!imageKosValidationResult) {
      throw new InvariantError(imageKosValidationResult.error.message);
    }
  },
};

module.exports = KossValidator;
