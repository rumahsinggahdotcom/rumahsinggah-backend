const autoBind = require('auto-bind');

class ReviewsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBind(this);
  }

  async postReviewsHandler(request, h) {
    const {
      userId,
      kosId,
      score,
      review,
    } = request.payload;

    await this._validator.validateReviewsPayload({
      userId,
      kosId,
      score,
      review,
    });

    const id = await this._service.addReview({
      userId,
      kosId,
      score,
      review,
    });

    const response = h.response({
      status: 'success',
      message: 'Review berhasil ditambahkan',
      data: {
        id,
      },
    });

    response.code(200);
    return response;
  }

  async getReviewByIdHandler(request, h) {
    const { reviewId } = request.params;
    const review = await this._service.getReviewById(reviewId);

    const response = h.response({
      status: 'success',
      data: {
        review,
      },
    });

    response.code(200);
    return response;
  }
}

module.exports = ReviewsHandler;
