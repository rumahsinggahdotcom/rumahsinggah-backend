/* eslint-disable camelcase */
const crypto = require('crypto');
const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const midtransClient = require('midtrans-client');
const { mapDBToModel } = require('../utils');
const InvariantError = require('../exceptions/InvariantError');
const NotFoundError = require('../exceptions/NotFoundError');
const AuthenticationError = require('../exceptions/AuthenticationError');

class BookingService {
  constructor() {
    this._pool = new Pool();
    this._snap = new midtransClient.Snap({
      isProduction: false,
      serverKey: process.env.MIDTRANS_SERVER_KEY,
      clientKey: process.env.MIDTRANS_CLIENT_KEY,
    });
  }

  async postBooking({
    roomId,
    userId,
    ownerId,
    start,
    end,
    totalPrice,
    status,
  }) {
    const id = `booking-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO bookings values($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id',
      values: [id, roomId, userId, ownerId, start, end, totalPrice, status],
    };

    const { rows } = await this._pool.query(query);

    if (!rows[0].id) {
      throw new InvariantError('Gagal melakukan booking');
    }

    return rows[0].id;
  }

  async getBookingsByOwnerId(ownerId) {
    console.log(ownerId);
    const query = {
      text: 'SELECT b.room_id, b.start, b.end, b.total_price, b.status, u.fullname FROM bookings AS b LEFT JOIN users AS u ON b.user_id = u.id WHERE b.owner_id = $1',
      values: [ownerId],
    };

    const { rows } = await this._pool.query(query);
    console.log(rows);

    if (!rows.length) {
      throw new NotFoundError('Gagal menampilkan list bookings.');
    }

    return rows.map(mapDBToModel);
  }

  async getBookingById(id) {
    const query = {
      text: 'SELECT * FROM bookings WHERE id = $1',
      values: [id],
    };

    const { rows } = await this._pool.query(query);

    if (!rows.length) {
      throw new NotFoundError('Booking tidak ditemukan');
    }

    return rows.map(mapDBToModel)[0];
  }

  async putBookingById(id, status) {
    const query = {
      text: 'UPDATE bookings SET status = $2 WHERE id = $1 RETURNING id',
      values: [id, status],
    };

    const { rows } = await this._pool.query(query);

    if (!rows[0].id) {
      throw new NotFoundError('Gagal melakukan update. Booking tidak ditemukan.');
    }
  }

  async verifyUserBookingAccess(id, credentialId) {
    const query = {
      text: 'SELECT id, user_id FROM bookings WHERE id = $1',
      values: [id],
    };

    const { rows } = await this._pool.query(query);

    if (!rows.length) {
      throw new NotFoundError('Booking tidak ditemukan');
    }

    if (rows[0].user_id !== credentialId) {
      throw new AuthenticationError('Anda tidak berhak mengakses resource ini');
    }
  }

  async verifyOwnerBookingAccess(id, credentialId) {
    const query = {
      text: 'SELECT id, owner_id FROM bookings WHERE id = $1',
      values: [id],
    };

    const { rows } = await this._pool.query(query);

    if (!rows.length) {
      throw new NotFoundError('Booking tidak ditemukan');
    }

    if (rows[0].owner_id !== credentialId) {
      throw new AuthenticationError('Anda tidak berhak mengakses resource ini');
    }
  }

  async postMidtransTransaction({
    id,
    totalPrice,
    name,
    type,
    fullname,
    phoneNumber,
    address,
  }) {
    const parameters = {
      transaction_details: {
        order_id: id,
        gross_amount: totalPrice,
      },
      customer_details: {
        first_name: fullname,
        phone: phoneNumber,
        // billing_address: {
        //   address,
        // },
      },
      // item_details: [{
      //   name,
      //   category: type,
      //   price: totalPrice,
      //   quantity: 1,
      // }],
    };

    try {
      const midtransResponse = await this._snap.createTransaction(parameters);
      return midtransResponse;
    } catch (e) {
      return e.error_messages;
    }
  }

  async midtransNotification(notificationJson) {
    const statusResponse = this._snap.transaction.notification(notificationJson);

    const orderId = statusResponse.order_id;
    const transactionStatus = statusResponse.transaction_status;
    const fraudStatus = statusResponse.fraud_status;

    const hash = crypto.createHash('sha512').update(`${statusResponse.transaction_id}${statusResponse.status_code}${statusResponse.gross_amount}${process.env.MIDTRANS_SERVER_KEY}`);

    if (hash !== statusResponse.signature_key) {
      const message = 'Invalid Signature Key';
      return {
        message,
        orderId,
        transactionStatus,
        fraudStatus,
      };
    }

    return { orderId, transactionStatus, fraudStatus };
  }
}

module.exports = BookingService;
