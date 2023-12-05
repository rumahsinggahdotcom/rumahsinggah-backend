const autoBind = require('auto-bind');

class BookingsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBind(this);
  }

  async postUsersBookingHandler(request, h) {
    const {
      roomId,
      userId,
      ownerId,
      start,
      end,
      totalPrice,
      status,
    } = request.payload;

    await this._validator.validateBookingPayload({
      roomId,
      userId,
      ownerId,
      start,
      end,
      totalPrice,
      status,
    });

    const id = await this._service.postUsersBooking({
      roomId,
      userId,
      ownerId,
      start,
      end,
      totalPrice,
      status,
    });

    const response = h.response({
      status: 'success',
      message: 'Berhasil melakukan booking',
      data: {
        id,
      },
    });

    response.code(201);

    return response;
  }
}

module.exports = BookingsHandler;
