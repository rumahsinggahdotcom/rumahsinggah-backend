const { RoomsPayloadSchema } = require('./schema');
const InvariantError = require('../../exceptions/InvariantError');

const ReviewsValidator = {
  validateReviewPayload: (payload) => {
    const reviewValidationResult = RoomsPayloadSchema.validate(payload);
    if (!reviewValidationResult) {
      throw new InvariantError(reviewValidationResult.error.message);
    }
  },
};

module.exports = ReviewsValidator;
