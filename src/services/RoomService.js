const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../exceptions/InvariantError');

class RoomService {
  constructor() {
    this._pool = new Pool();
  }

  async addRoom(kosId, {
    type,
    maxPeople,
    price,
    quantity,
  }) {
    const roomId = `room_koss-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO room values ($1, $2, $3, $4, $5, $6) RETURNING id',
      values: [roomId, type, maxPeople, price, kosId, quantity],
    };

    const { rows } = await this._pool.query(query);

    if (!rows[0].id) {
      throw new InvariantError('Room Kos Gagal Ditambahkan.');
    }

    return rows[0].id;
  }

  async getRoomByKosId(kosId) {
    const query = {
      text: 'SELECT * FROM room WHERE kos_id = $1',
      values: [kosId],
    };

    const { rows } = await this._pool.query(query);

    if (!rows.length) {
      throw new InvariantError('Room Tidak Ditemukan.');
    }

    return rows;
  }
}
module.exports = RoomService;
