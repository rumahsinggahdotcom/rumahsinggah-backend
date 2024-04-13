const bcrypt = require('bcrypt');
const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const { mapDBToModel } = require('../utils');
const InvariantError = require('../exceptions/InvariantError');
const NotFoundError = require('../exceptions/NotFoundError');
const AuthorizationError = require('../exceptions/AuthorizationError');
const AuthenticationError = require('../exceptions/AuthenticationError');

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

  async editUserById(id, {
    fullname,
    phoneNumber,
    address,
    gender,
  }) {
    const query = {
      text: 'UPDATE users SET fullname = $2, phone_number = $3, address = $4, gender = $5 WHERE id = $1 RETURNING id',
      values: [id, fullname, phoneNumber, address, gender],
    };

    const { rows } = await this._pool.query(query);

    if (!rows[0].id) {
      throw new InvariantError('Gagal memperbarui user. User tidak ditemukan');
    }
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

  async editPasswordById(id, {
    oldPassword,
    newPassword,
  }) {
    const match = await this.verifyPassword(id, oldPassword);

    if (!match) {
      throw new InvariantError('Gagal Mengubah Password. Kredensial yang anda berikan salah');
    }

    const newHashedPassword = await bcrypt.hash(newPassword, 10);

    const query = {
      text: 'UPDATE users SET password = $2 WHERE id = $1 RETURNING id',
      values: [id, newHashedPassword],
    };

    const { rows } = await this._pool.query(query);

    if (!rows[0].id) {
      throw new NotFoundError('Gagal Mengubah Password. User tidak ditemukan');
    }
  }

  async verifyPassword(id, oldPassword) {
    const query = {
      text: 'SELECT password FROM users WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('User tidak ditemukan.');
    }

    const { password: hashedPassword } = result.rows[0];
    const match = await bcrypt.compare(oldPassword, hashedPassword);

    return match;
  }

  async getUsersByKosId(kosId) {
    const query = {
      text: 'SELECT u.id, u.fullname, u.phone_number, u.address, u.gender, u.username, r. type FROM users AS u INNER JOIN booking AS b ON u.id = b.user_id INNER JOIN room AS r ON b.room_id = r.id INNER JOIN koss AS k ON k.id = r.kos_id WHERE k.id = $1',
      values: [kosId],
    };
    const { rows } = await this._pool.query(query);

    if (!rows.length) {
      throw new NotFoundError('User Tidak Ditemukan.');
    }

    return rows.map(mapDBToModel);
  }

  async getUserById(id) {
    const query = {
      text: 'SELECT id, fullname, username, phone_number, address, gender FROM users WHERE id = $1',
      values: [id],
    };

    const { rows } = await this._pool.query(query);

    if (!rows.length) {
      throw new InvariantError('User tidak ditemukan.');
    }

    return rows.map(mapDBToModel)[0];
  }

  async getUserDetailMidtransById(id) {
    const query = {
      text: 'SELECT fullname, phone_number, address FROM users WHERE id = $1',
      values: [id],
    };

    const { rows } = await this._pool.query(query);

    return rows.map(mapDBToModel)[0];
  }

  async verifyUsersCredentials({ username, password }) {
    const query = {
      text: 'SELECT id, password FROM users WHERE username = $1',
      values: [username],
    };

    const { rows } = await this._pool.query(query);
    if (!rows.length) {
      throw new AuthenticationError('Kredensial yang anda berikan salah.');
    }

    const { id, password: hashedPassword } = rows[0];

    const match = bcrypt.compare(password, hashedPassword);

    if (!match) {
      throw new AuthenticationError('Kredensial yang anda berikan salah');
    }

    return id;
  }

  async verifyUsersOnly(id) {
    const query = {
      text: 'SELECT id FROM users WHERE id = $1',
      values: [id],
    };

    const { rows } = await this._pool.query(query);

    if (!rows.length) {
      throw new AuthorizationError('Anda tidak berhak mengakses resources ini');
    }
  }
}

module.exports = UsersService;
