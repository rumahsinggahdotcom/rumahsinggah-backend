const bcrypt = require('bcrypt');
const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../exceptions/InvariantError');
const NotFoundError = require('../exceptions/NotFoundError');
const AuthenticationError = require('../exceptions/AuthenticationError');
const { mapDBToModel } = require('../utils');
// const AuthenticationError = require('../exceptions/AuthenticationError');

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

  async getOwnerById(id) {
    const queryOwner = {
      text: 'SELECT * FROM owners WHERE id = $1',
      values: [id],
    };

    const { rows } = await this._pool.query(queryOwner);
    console.log(rows.map(mapDBToModel)[0]);

    if (!rows.length) {
      throw new NotFoundError('Owner tidak ditemukan');
    }

    return rows.map(mapDBToModel)[0];
  }

  async verifyUsername(username) {
    const query = {
      text: 'SELECT username FROM owners WHERE username = $1',
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
      text: 'UPDATE owners SET password = $1 where id = $2 RETURNING id',
      values: [newHashedPassword, id],
    };

    const { rows } = await this._pool.query(query);

    if (!rows.length) {
      throw new NotFoundError('Gagal memperbarui Owner. Id tidak ditemukan');
    }
  }

  async verifyPassword(id, oldPassword) {
    const query = {
      text: 'SELECT password FROM owners where id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);
    console.log(result);

    if (!result.rowCount) {
      throw new NotFoundError('Gagal Mengubah Password. Id tidak ditemukan');
    }
    const { password: hashedPassword } = result.rows[0];

    const match = await bcrypt.compare(oldPassword, hashedPassword);
    console.log('testing purpose match:', match);
    return match;
  }

  async verifyOwnersCredentials({ username, password }) {
    console.log(username, password);
    const query = {
      text: 'SELECT id, password FROM owners WHERE username = $1',
      values: [username],
    };
    const result = await this._pool.query(query);
    // console.log(result);
    if (!result.rows.length) {
      throw new AuthenticationError('Kredensial yang anda berikan salah.');
    }
    const { id, password: hashedPassword } = result.rows[0];
    const match = await bcrypt.compare(password, hashedPassword);

    if (!match) {
      throw new AuthenticationError('Kredensial yang anda berikan salah.');
    }

    return id;
  }
}

module.exports = OwnersService;
