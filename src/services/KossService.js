const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const path = require('path');
const InvariantError = require('../exceptions/InvariantError');
const NotFoundError = require('../exceptions/NotFoundError');
const { mapDBToModel } = require('../utils');
const StorageService = require('./StorageService');

class KossService {
  constructor() {
    this._pool = new Pool();
    this._storageService = new StorageService(path.resolve(__dirname, '../api/file'));
  }

  async addKos({
    ownerId,
    name,
    address,
    description,
  }, arrayImgs) {
    const id = `koss-${nanoid(16)}`;

    const client = await this._pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('SET CONSTRAINTS ALL DEFERRED');
      const query = {
        text: 'INSERT INTO koss values($1, $2, $3, $4, $5, $6) RETURNING id',
        values: [id, ownerId, name, address, description, null],
      };
      const { rows } = await client.query(query);
      if (!rows[0].id) {
        throw new InvariantError('Kos Gagal Ditambahkan.');
      }
      const kosId = rows[0].id;

      if (arrayImgs) {
        await Promise.all(arrayImgs.map(async (image) => {
          await this.storeImgToStorageDb(kosId, image, { client });
        }));
      }
      await client.query('COMMIT');

      return rows[0].id;
    } catch (error) {
      await client.query('ROLLBACK');
      throw new InvariantError(error.message);
    }
  }

  async addImageKos(kosId, arrayImgs) {
    const imgsId = [];
    const client = await this._pool.connect();
    try {
      await client.query('BEGIN');
      await Promise.all(arrayImgs.map(async (image) => {
        const imgId = await this.storeImgToStorageDb(kosId, image, { client });
        imgsId.push(imgId);
      }));
      await client.query('COMMIT');

      return imgsId;
    } catch (error) {
      await client.query('ROLLBACK');
      throw new InvariantError(error.message);
    }
  }

  async storeImgToStorageDb(kosId, image, { client = this._pool } = {}) {
    const kosQuery = {
      text: 'SELECT owner_id, name FROM koss where id = $1',
      values: [kosId],
    };
    const resultKos = await client.query(kosQuery);
    const kosOwnerId = resultKos.rows[0].owner_id;
    const kosName = resultKos.rows[0].name;
    const filename = `${kosOwnerId}_${kosName}_${image.hapi.filename}`;

    const id = `img_kos-${nanoid(16)}`;
    const imgKosQuery = {
      text: 'INSERT INTO image_koss values($1, $2, $3) RETURNING id',
      values: [id, kosId, filename],
    };

    const resImgKos = await client.query(imgKosQuery);
    if (!resImgKos.rows[0].id) {
      throw new InvariantError('Image Kos Gagal Ditambahkan.');
    }

    await this._storageService.writeFile(image, filename, 'koss');
    return resImgKos.rows[0].id;
  }

  async getKoss() {
    const query = {
      text: 'SELECT k.id, k.name, k.owner_id, k.address, i.images FROM koss AS k LEFT JOIN image_koss AS i ON k.id = i.kos_id',
    };

    const { rows } = await this._pool.query(query);

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

  async editKosById(id, {
    name,
    address,
    description,
  }) {
    const query = {
      text: 'UPDATE koss SET name = $2, address = $3, description = $4 WHERE id = $1 RETURNING id',
      values: [id, name, address, description],
    };

    const { rows } = await this._pool.query(query);
    if (!rows[0].id) {
      throw new InvariantError('Gagal memperbarui Kos. Id tidak ditemukan.');
    }
  }

  async delImageKosById(id) {
    const query = {
      text: 'DELETE FROM image_koss where id = $1 RETURNING id, image',
      values: [id],
    };

    const { rows } = await this._pool.query(query);
    const imgId = rows[0].id;
    const filename = rows[0].image;

    if (!rows[0].id) {
      throw new NotFoundError('Image gagal dihapus. Id tidak ditemukan');
    }

    return { filename, imgId };
  }
}

module.exports = KossService;
