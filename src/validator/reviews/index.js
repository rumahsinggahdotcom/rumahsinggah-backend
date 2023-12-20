const { ReviewPayloadSchema, EditReviewSchemaPayload } = require('./schema');
const InvariantError = require('../../exceptions/InvariantError');

const ReviewsValidator = {
  validateReviewPayload: (payload) => {
    const reviewValidationResult = ReviewPayloadSchema.validate(payload);
    if (!reviewValidationResult) {
      throw new InvariantError(reviewValidationResult.error.message);
    }
  },

  validateEditReviewPayload: (payload) => {
    const editReviewValidationResult = EditReviewSchemaPayload.validate(payload);
    if (!editReviewValidationResult) {
      throw new InvariantError(editReviewValidationResult.error.message);
    }
  },
};

module.exports = ReviewsValidator;
