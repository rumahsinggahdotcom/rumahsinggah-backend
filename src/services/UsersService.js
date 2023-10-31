const bcrypt = require('bcrypt');
const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../exceptions/InvariantError');
const { mapDBToModel } = require('../utils');

class UsersService {
  constructor() {
    this._pool = new Pool();
  }

  async addUser({
    fullname,
    username,
    password,
    phoneNumber,
    address,
    gender,
  }) {
    await this.verifyNewUser(username);

    const id = `user-${nanoid(16)}`;
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = {
      text: 'INSERT INTO users VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      values: [id, fullname, username, hashedPassword, phoneNumber, address, gender],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('User failed to add');
    }
    return result.rows[0].id;
  }

  async verifyNewUser(username, phoneNumber) {
    const query = {
      text: 'SELECT username, phone_number FROM users WHERE username = $1 OR phone_number = $2',
      values: [username, phoneNumber],
    };

    const result = await this._pool.query(query);

    if (result.rows.length > 0) {
      throw new InvariantError('User failed to add. Username or phone number have been used');
    }
  }

  async getUsersByKosId(kosId) {
    const query = {
      text: 'SELECT u.id, u.fullname, u.phone_number, u.address, u.gender, u.username, r. type FROM users AS u INNER JOIN booking AS b ON u.id = b.user_id INNER JOIN room AS r ON b.room_id = r.id INNER JOIN koss AS k ON k.id = r.kos_id WHERE k.id = $1',
      values: [kosId],
    };
    const { rows } = await this._pool.query(query);

    if (!rows.length) {
      throw new InvariantError('User Tidak Ditemukan.');
    }

    return rows.map(mapDBToModel);
  }
}

module.exports = UsersService;
