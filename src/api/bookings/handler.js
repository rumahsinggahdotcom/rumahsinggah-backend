/* eslint-disable camelcase */
const autoBind = require('auto-bind');

class BookingsHandler {
  constructor(bookingsService, usersService, roomsService, validator) {
    this._bookingsService = bookingsService;
    this._usersService = usersService;
    this._roomsService = roomsService;
    this._validator = validator;

    autoBind(this);
  }

  async postBookingHandler(request, h) {
    const {
      roomId,
      ownerId,
      start,
      end,
      duration,
      status,
    } = request.payload;

    console.log('roomId, ownerId, start, end, duration, status', roomId, ownerId, start, end, duration, status);
    const { id: credentialId } = request.auth.credentials;

    const totalPrice = await this._roomsService.getPriceByRoomId(roomId, duration);
    console.log('totalPrice', totalPrice);
    await this._roomsService.verifyRoomsOwner(roomId, ownerId);

    await this._validator.validateBookingPayload({
      start,
      end,
      totalPrice,
      status,
    });

    await this._usersService.verifyUsersOnly(credentialId);

    const id = await this._bookingsService.postBooking({
      roomId,
      userId: credentialId,
      ownerId,
      start,
      end,
      totalPrice,
      status,
    });

    const response = h.response({
      status: 'success',
      message: 'Berhasil melakukan request booking',
      data: {
        id,
      },
    });

    response.code(201);

    return response;
  }

  async getBookingsByRoleHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;
    const bookings = await this._bookingsService.getBookingsByRole(credentialId);
    console.log('bookings', bookings);

    const response = h.response({
      status: 'success',
      data: {
        bookings,
      },
    });

    response.code(200);
    return response;
  }

  async getBookingByIdHandler(request, h) {
    const { id } = request.params;
    // const { id: credentialId } = request.auth.credentials;
    // await this._bookingsService.verifyOwnerBookingAccess(credentialId);
    const booking = await this._bookingsService.getBookingById(id);

    const response = h.response({
      status: 'success',
      data: {
        booking,
      },
    });

    response.code(200);
    return response;
  }

  async confirmProcessBookingByIdHandler(request, h) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;
    const {
      status,
      note,
    } = request.payload;

    let response;
    await this._bookingsService.verifyOwnerBookingAccess(id, credentialId);

    if (status === 'unpaid') {
      const {
        roomId,
        userId,
        totalPrice,
      } = await this._bookingsService.getBookingById(id);
      console.log(roomId, userId, totalPrice);

      const { type, name } = await this._roomsService.getRoomDetailMidtransById(roomId);
      const {
        fullname,
        phoneNumber,
        address,
        // } = await this._usersService.getUserDetailMidtransById(userId);
      } = await this._usersService.getUserById(userId);
      console.log(fullname, phoneNumber, address);

      const {
        bookingId,
        snapToken,
        snapRedirectUrl,
      } = await this._bookingsService.postMidtransTransaction({
        id,
        totalPrice,
        name,
        type,
        fullname,
        phoneNumber,
        address,
      });
      console.log(bookingId, snapToken, snapRedirectUrl);

      await this._roomsService.reduceRoomQuantityById(roomId, 1);
      await this._bookingsService.editBookingStatusById(id, status, note);

      response = h.response({
        status: 'success',
        message: 'Konfirmasi booking berhasil',
        data: {
          id: bookingId,
          totalPrice,
          name,
          type,
          fullname,
          phoneNumber,
          address,
          snapToken,
          snapRedirectUrl,
        },
      });

      response.code(200);
    } else if (status === 'rejected') {
      console.log('status', status);
      await this._bookingsService.editBookingStatusById(id, status, note);

      response = h.response({
        status: 'success',
        message: 'Tolak booking berhasil',
        data: {
          note,
        },
      });

      response.code(200);
    }

    return response;
  }

  // async postMidtransTransactionHandler(request, h) {
  //   const {
  //     id,
  //     start,
  //     end,
  //     totalPrice,
  //     name,
  //     type,
  //     fullname,
  //     phoneNumber,
  //     address,
  //   } = request.payload;

  //   const { id: credentialId } = request.auth.credentials;
  //   await this._bookingsService.verifyUserBookingAccess(id, credentialId);

  //   const midtransResponse = await this._bookingsService.postMidtransTransaction({
  //     id,
  //     start,
  //     end,
  //     totalPrice,
  //     name,
  //     type,
  //     fullname,
  //     phoneNumber,
  //     address,
  //   });

  //   const response = h.response({
  //     status: 'success',
  //     message: 'Berhasil melakukan transaksi',
  //     data: {
  //       midtransResponse,
  //     },
  //   });

  //   response.code(200);
  //   return response;
  // }

  async midtransNotificationHandler(request, h) {
    let response;
    const notificationJson = request.payload;

    const {
      message,
      orderId,
      transactionStatus,
      fraudStatus,
    } = await this._bookingsService.midtransNotification(notificationJson);

    if (transactionStatus === 'capture') {
      if (fraudStatus === 'accept') {
        await this._bookingsService.editBookingStatusById(orderId, 'paid');
      }
    } else if (transactionStatus === 'settlement') {
      await this._bookingsService.editBookingStatusById(orderId, 'paid');
    } else if (transactionStatus === 'cancel' || transactionStatus === 'expire') {
      await this._bookingsService.editBookingStatusById(orderId, 'canceled');
    } else if (transactionStatus === 'pending') {
      await this._bookingsService.editBookingStatusById(orderId, 'pending');
    }

    if (message) {
      response = h.response({
        status: 'error',
        message,
      });
      response.code(500);
    } else {
      response = h.response({
        status: 'success',
        message: 'OK',
      });
      response.code(200);
    }

    return response;
  }
}

module.exports = BookingsHandler;
