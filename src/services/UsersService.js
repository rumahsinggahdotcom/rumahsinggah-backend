const bcrypt = require('bcrypt');
const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../exceptions/InvariantError');

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
      text: 'SELECT id FROM users WHERE '
    }
  }
}

module.exports = UsersService;
