const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../exceptions/InvariantError');

class ImageKossService {
  constructor() {
    this._pool = new Pool();
  }

  async addImageKos(url, kosId) {
    const id = `image_koss-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO image_koss values($1, $2, $3) RETURNING id',
      values: [id, kosId, url],
    };

    const { rows } = await this._pool.query(query);

    if (!rows[0].id) {
      throw new InvariantError('Image Kos Gagal Ditambahkan.');
    }

    return rows[0].id;
  }
}

module.exports = ImageKossService;
