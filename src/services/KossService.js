const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../exceptions/InvariantError');

class KossService {
  constructor() {
    this._pool = new Pool();
  }

  async addKos({
    ownerId,
    name,
    address,
  }) {
    const id = `koss-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO koss values($1, $2, $3, $4, $5, $6) RETURNING id',
      values: [id, ownerId, null, name, address, null],
    };

    const { rows } = await this._pool.query(query);

    if (!rows[0].id) {
      throw new InvariantError('Kos Gagal Ditambahkan.');
    }

    return rows[0].id;
  }
}

module.exports = KossService;
