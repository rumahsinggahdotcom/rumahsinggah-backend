const bcrypt = require('bcrypt');
const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../exceptions/InvariantError');
const NotFoundError = require('../exceptions/NotFoundError');

class OwnersService {
  constructor() {
    this._pool = new Pool();
  }

  async addOwner({
    fullname,
    username,
    password,
    address,
    gender,
    phoneNumber,
  }) {
    const id = `owner-${nanoid(16)}`;
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = {
      text: 'INSERT INTO owners VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      values: [id, fullname, username, hashedPassword, address, gender, phoneNumber],
    };

    const { rows } = await this._pool.query(query);

    if (!rows[0].id) {
      throw new InvariantError('Owner Gagal Ditambahkan');
    }

    return rows[0].id;
  }

  async editOwnerById(id, {
    fullname,
    username,
    password,
    address,
    gender,
    phoneNumber,
  }) {
    const query = {
      text: 'UPDATE owners SET fullname = $1, username = $2, password = $3, address = $4, gender = $5, phone_number = $6 WHERE id = $7 RETURNING id',
      values: [fullname, username, password, address, gender, phoneNumber, id],
    };

    const { rows } = await this._pool.query(query);

    if (!rows.length) {
      throw new NotFoundError('Gagal memperbaru Owner. Id tidak ditemukan');
    }
  }
}

module.exports = OwnersService;
