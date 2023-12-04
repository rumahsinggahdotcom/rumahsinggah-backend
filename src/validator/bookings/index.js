const InvariantError = require('../../exceptions/InvariantError');
const { BookingsPayloadSchema } = require('./schema');

const BookingValidator = {
  validateBookingPayload: (payload) => {
    const validationResult = BookingsPayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = BookingValidator;
