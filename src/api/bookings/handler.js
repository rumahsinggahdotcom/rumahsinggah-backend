/* eslint-disable camelcase */
const autoBind = require('auto-bind');
import crypto from 'crypto';

class BookingsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBind(this);
  }

  async postBookingHandler(request, h) {
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
      start,
      end,
      totalPrice,
      status,
    });

    const id = await this._service.postBooking({
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

  async getBookingsByOwnerIdHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;
    const bookings = await this._service.getBookingsByOwnerId(credentialId);
    // console.log(bookings);

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
    const booking = await this._service.getBookingById(id);

    const response = h.response({
      status: 'success',
      data: {
        booking,
      },
    });

    response.code(200);
    return response;
  }

  async putBookingByIdHandler(request, h) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;
    const { status } = request.payload;

    await this._service.verifyOwnerBookingAccess(id, credentialId);
    await this._service.putBookingById(id, status);

    const response = h.response({
      status: 'success',
      message: 'Update booking berhasil',
    });

    response.code(200);
    return response;
  }

  async postMidtransTransactionHandler(request, h) {
    const {
      id,
      start,
      end,
      totalPrice,
      type,
      fullname,
      phoneNumber,
      address,
    } = request.payload;

    const { id: credentialId } = request.auth.credentials;
    await this._service.verifyUserBookingAccess(id, credentialId);

    const midtransResponse = await this._service.postMidtransTransaction({
      id,
      start,
      end,
      totalPrice,
      type,
      fullname,
      phoneNumber,
      address,
    });

    const bookingId = await this._service.putBookingById(id, 'Paid');

    const response = h.response({
      status: 'success',
      message: 'Berhasil melakukan transaksi',
      data: {
        bookingId,
        midtransResponse,
      },
    });

    response.code(200);
    return response;
  }

  async midtransNotificationHandler(request, h) {
    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      fraud_status,
    } = request.payload;

    await this._service.midtransNotification({
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      fraud_status,
    });
  }
}

module.exports = BookingsHandler;
