const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../exceptions/InvariantError');
const NotFoundError = require('../exceptions/NotFoundError');

class RoomService {
  constructor() {
    this._pool = new Pool();
  }

  async addRoom({
    type,
    maxPeople,
    price,
    kosId,
    quantity,
  }) {
    const id = `room_koss-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO room values ($1, $2, $3, $4, $5, $6) RETURNING id',
      values: [id, type, maxPeople, price, kosId, quantity],
    };

    const { rows } = await this._pool.query(query);

    if (!rows[0].id) {
      throw new InvariantError('Room Kos Gagal Ditambahkan.');
    }

    return rows[0].id;
  }

  async getRoomsByKosId(kosId) {
    const query = {
      text: 'SELECT * FROM room WHERE kos_id = $1',
      values: [kosId],
    };

    const { rows } = await this._pool.query(query);

    if (!rows.length) {
      throw new NotFoundError('Rooms tidak ditemukan.');
    }

    return rows;
  }

  async getRoomById(id) {
    const query = {
      text: 'SELECT * FROM room WHERE id = $1',
      values: [id],
    };

    const { rows } = await this._pool.query(query);

    if (!rows.length) {
      throw new NotFoundError('Room tidak ditemukan.');
    }

    return rows;
  }

  async editRoomById(id, {
    type,
    maxPeople,
    price,
    quantity,
  }) {
    const query = {
      text: 'UPDATE room SET type = $2, max_people = $3, price = $4, quantity = $5 WHERE id = $1 RETURNING id',
      values: [id, type, maxPeople, price, quantity],
    };

    const { rows } = await this._pool.query(query);

    if (!rows[0].id) {
      throw new InvariantError('Gagal Memperbarui Room. Id Tidak Ditemukan.');
    }

    return rows[0].id;
  }
}
module.exports = RoomService;
