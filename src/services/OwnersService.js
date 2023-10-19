const bcrypt = require('bcrypt');
const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../exceptions/InvariantError');

class OwnersService {
  constructor() {
    this._pool = new Pool();
  }

  async addOwner({
    fullname,
    username,
    password,
    address,
    phoneNumber,
  }) {
    const id = `owner-${nanoid(16)}`;
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = {
      text: 'INSERT INTO owners VALUES($1, $2, $3, $4, %5, $6) RETURNING id',
      values: [id, fullname, username, hashedPassword, address, phoneNumber],
    };

    const { rows } = await this._pool.query(query);

    if (!rows[0].id) {
      throw new InvariantError('Owner Gagal Ditambahkan');
    }

    return rows[0].id;
  }
}

module.exports = OwnersService;
