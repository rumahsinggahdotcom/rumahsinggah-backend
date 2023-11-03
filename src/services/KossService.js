const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../exceptions/InvariantError');
const NotFoundError = require('../exceptions/NotFoundError');
const { mapDBToModel } = require('../utils');

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
      text: 'INSERT INTO koss values($1, $2, $3, $4, $5) RETURNING id',
      values: [id, ownerId, name, address, null],
    };

    const { rows } = await this._pool.query(query);

    if (!rows[0].id) {
      throw new InvariantError('Kos Gagal Ditambahkan.');
    }

    return rows[0].id;
  }

  async addImageKos(kosId, url) {
    const id = `img_kos-${nanoid(16)}`;

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

  async getKoss() {
    const query = {
      text: 'SELECT k.id, k.name, k.owner_id, k.address, i.images FROM koss AS k LEFT JOIN image_koss AS i ON k.id = i.kos_id',
    };
    const { rows } = await this._pool.query(query);
    console.log('result:', rows);
    const groupedData = rows.reduce((result, item) => {
      const existingItem = result.find((groupedItem) => groupedItem.id === item.id);

      if (existingItem) {
        existingItem.images.push({ image: item.images });
      } else {
        result.push({
          id: item.id,
          name: item.name,
          owner_id: item.owner_id,
          address: item.address,
          images: [{ image: item.images }],
        });
      }

      return result;
    }, []);

    return groupedData.map(mapDBToModel);
  }

  async getKosById(kosId) {
    const queryImageKos = {
      text: 'SELECT id as image_id, images FROM image_koss WHERE kos_id = $1',
      values: [kosId],
    };
    const resultImageKos = await this._pool.query(queryImageKos);

    const queryKos = {
      text: 'SELECT * FROM koss where id = $1',
      values: [kosId],
    };
    const resultKos = await this._pool.query(queryKos);
    if (!resultKos.rows) {
      throw new NotFoundError('Kos Tidak Ditemukan.');
    }
    const kos = resultKos.rows[0];
    kos.image = resultImageKos.rows;

    return kos;
  }

  async editKosById(kosId, {
    name,
    address,
  }) {
    const query = {
      text: 'UPDATE koss SET name = $2, address = $3 WHERE id = $1',
      values: [kosId, name, address],
    };

    const { rows } = await this._pool.query(query);

    if (!rows[0].id) {
      throw new NotFoundError('Gagal Memperbarui Koss. Id Tidak Ditemukan.');
    }

    return rows[0].id;
  }

  async delImageKosByKosId(kosId) {
    const delImgQuery = {
      text: 'DELETE FROM image_koss where kos_id = $1 RETURNING id',
      values: [kosId],
    };

    const { rows } = await this._pool.query(delImgQuery);

    if (!rows.length) {
      throw new NotFoundError('Image gagal dihapus. Id tidak ditemukan');
    }
  }
}

module.exports = KossService;
