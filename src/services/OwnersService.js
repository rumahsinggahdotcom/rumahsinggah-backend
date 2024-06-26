const bcrypt = require('bcrypt');
const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../exceptions/InvariantError');
const NotFoundError = require('../exceptions/NotFoundError');
const AuthorizationError = require('../exceptions/AuthorizationError');
const AuthenticationError = require('../exceptions/AuthenticationError');
const { mapDBToModel } = require('../utils');

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
    gender,
    phoneNumber,
  }) {
    const query = {
      text: 'UPDATE owners SET fullname = $2, address = $3, gender = $4, phone_number = $5 WHERE id = $1 RETURNING id',
      values: [id, fullname, address, gender, phoneNumber],
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

    if (!result.rowCount) {
      throw new NotFoundError('Gagal Mengubah Password. Id tidak ditemukan');
    }
    const { password: hashedPassword } = result.rows[0];

    const match = await bcrypt.compare(oldPassword, hashedPassword);
    return match;
  }

  async verifyOwnersCredentials({ username, password }) {
    const query = {
      text: 'SELECT id, password, fullname FROM owners WHERE username = $1',
      values: [username],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new AuthenticationError('Username atau password yang anda berikan salah.');
    }
    const { id, password: hashedPassword, fullname } = result.rows[0];
    const match = await bcrypt.compare(password, hashedPassword);

    if (!match) {
      throw new AuthenticationError('Username atau password yang anda berikan salah.');
    }

    return { id, fullname, role: 'owner' };
  }

  async verifyOwnersOnly(id) {
    const query = {
      text: 'SELECT id FROM owners WHERE id = $1',
      values: [id],
    };

    const { rows } = await this._pool.query(query);

    if (!rows.length) {
      throw new AuthorizationError('Anda tidak berhak mengakses resources ini');
    }
  }
}

module.exports = OwnersService;
