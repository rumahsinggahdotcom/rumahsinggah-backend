const { Pool } = require('pg');
const nanoid = require('nanoid');
const InvariantError = require('../exceptions/InvariantError');
const NotFoundError = require('../exceptions/NotFoundError');

class BookingService {
  constructor() {
    this._pool = new Pool();
  }

  async postUsersBooking({
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

    return rows;
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
}

module.exports = BookingService;
