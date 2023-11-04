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
    this._storageService = new StorageService(path.resolve(__dirname, '../api/koss/file'));
  }

  async addKos({
    ownerId,
    name,
    address,
  }, images) {
    // const connection = await this._pool.getConnection();
    let result;
    const id = `koss-${nanoid(16)}`;
    try {
      await this._pool.query('BEGIN');
      const query = {
        text: 'INSERT INTO koss values($1, $2, $3, $4, $5) RETURNING id',
        values: [id, ownerId, name, address, null],
      };
      result = await this._pool.query(query);
      if (images.length > 1) {
        await Promise.all(images.map(async (image) => {
          const filename = +new Date() + image.hapi.filename;
          console.log('filename 1:', filename);
          await this.addImageKos('result.rows[0].id', filename, image);
          console.log('filename 2:', filename);
          await this._pool.query('COMMIT');
          await this._storageService.writeFile(image, filename);
        }));
      } else {
        const filename = +new Date() + images.hapi.filename;
        await this.addImageKos(result.rows[0].id, filename);
        await this._pool.query('COMMIT');
        await this._storageService.writeFile(images, filename);
      }
    } catch (error) {
      await this._pool.query('ROLLBACK');
      throw new InvariantError(error.detail);
    }

    if (!result.rows[0].id) {
      throw new InvariantError('Kos Gagal Ditambahkan.');
    }

    return result.rows[0].id;
  }

  async addImageKos(kosId, filename) {
    const id = `img_kos-${nanoid(16)}`;
    const url = `http://${process.env.HOST}:${process.env.PORT}/file/image/${filename}`;
    console.log('id 1:', id);
    console.log('kosId 1:', kosId);
    const query = {
      text: 'INSERT INTO image_koss values($1, $2, $3) RETURNING id',
      values: [id, kosId, url],
    };

    const { rows } = await this._pool.query(query);
    console.log('id 2:', id);
    console.log('kosId 2:', kosId);
    console.log(rows);
    if (!rows[0].id) {
      throw new InvariantError('Image Kos Gagal Ditambahkan.');
    }
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
