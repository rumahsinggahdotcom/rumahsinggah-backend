const { Pool } = require('pg');
const nanoid = require('nanoid');
const InvariantError = require('../exceptions/InvariantError');
const NotFoundError = require('../exceptions/NotFoundError');
const { mapDBToModel } = require('../utils');
const AuthenticationError = require('../exceptions/AuthenticationError');

class BookingService {
  constructor() {
    this._pool = new Pool();
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
    const id = `booking_${nanoid(16)}`;

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
    const query = {
      text: 'SELECT b.room_id, b.start, b.end, b.total_price, u.fullname FROM bookings as b LEFT JOIN users as u on b.user_id = u.id WHERE b.owner_id = $1',
      values: [ownerId],
    };

    const { rows } = this._pool.query(query);

    if (!rows.length) {
      throw new NotFoundError('Gagal menampilkan list bookings.');
    }

    return mapDBToModel(rows);
  }

  async getBookingById(id) {
    const query = {
      text: 'SELECT * FROM bookings WHERE id = $1',
      values: [id],
    };

    const { rows } = this._pool.query(query);

    if (!rows.length) {
      throw new NotFoundError('Booking tidak ditemukan');
    }

    return rows;
  }

  async putBookingById(id, status) {
    const query = {
      text: 'UPDATE bookings SET status = $2 WHERE id = $1 RETURNING id',
      values: [id, status],
    };

    const { rows } = this._pool.query(query);

    if (!rows[0].id) {
      throw new NotFoundError('Gagal melakukan update. Booking tidak ditemukan.');
    }
  }

  async verifyBookingAccess(id, credentialId) {
    const query = {
      text: 'SELECT id FROM bookings WHERE owner_id = $1',
      values: [credentialId],
    };

    const { rows } = await this._pool.query(query);

    if (!rows.length) {
      throw new NotFoundError('Booking tidak ditemukan');
    }

    if (rows[0].id !== id) {
      throw new AuthenticationError('Anda tidak berhak mengakses resource ini');
    }
  }
}

module.exports = BookingService;
