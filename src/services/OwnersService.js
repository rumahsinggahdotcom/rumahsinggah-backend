const bcrypt = require('bcrypt');
const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../exceptions/InvariantError');
const NotFoundError = require('../exceptions/NotFoundError');
const AuthenticationError = require('../exceptions/AuthenticationError');

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
    const result = await this.verifyUsername(username);

    if (result.rows.length > 0) {
      throw new InvariantError('Username sudah digunakan');
    }

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

  async verifyUsername({
    username,
  }) {
    const query = {
      text: 'SELECT username from owners where username = $1',
      values: [username],
    };

    const result = await this._pool.query(query);

    return result;
  }

  async editOwnerById(id, {
    fullname,
    address,
    phoneNumber,
  }) {
    const query = {
      text: 'UPDATE owners SET fullname = $1, address = $2, phone_number = $3 WHERE id = $4 RETURNING id',
      values: [fullname, address, phoneNumber, id],
    };

    const { rows } = await this._pool.query(query);

    if (!rows.length) {
      throw new NotFoundError('Gagal memperbarui Owner. Id tidak ditemukan');
    }
  }

  async editPasswordByUsername(username, {
    oldPassword,
    newPassword,
  }) {
    const queryUsername = await this.verifyUsername(username);
    if (queryUsername.rows.length === 0) {
      throw new NotFoundError('Username tidak ditemukan');
    }

    const match = await this.verifyPassword({ username, oldPassword });

    if (!match) {
      throw new AuthenticationError('Kredensial yang anda berikan salah.');
    }

    const newHashedPassword = await bcrypt.hash(newPassword, 10);
    const query = {
      text: 'UPDATE owners SET password = $1 where username = $2 RETURNING username',
      value: [newHashedPassword, username],
    };

    const { rows } = this._pool.query(query);

    if (!rows.length) {
      throw new NotFoundError('Gagal mengubah password. username tidak ditemukan');
    }
  }

  async verifyPassword({
    username,
    oldPassword,
  }) {
    const query = {
      text: 'SELECT password FROM owners where username = $1',
      value: [username],
    };

    const result = await this._pool.query(query);
    const { password: hashedPassword } = result.rows[0];

    const match = await bcrypt.compare(oldPassword, hashedPassword);

    return match;
  }
}

module.exports = OwnersService;
