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
        text: 'INSERT INTO koss values($1, $2, $3, $4, $5, $6) RETURNING id, name, owner_id',
        values: [id, ownerId, name, address, description, null],
      };
      const { rows } = await client.query(query);
      console.log('1');
      if (!rows[0].id) {
        throw new InvariantError('Kos Gagal Ditambahkan.');
      }
      const kosId = rows[0].id;
      const kosOwnerId = rows[0].owner_id;
      const kosName = rows[0].name;

      if (arrayImgs) {
        console.log('2');
        await Promise.all(arrayImgs.map(async (image) => {
          await this.writeAndCommitImageDatabase(kosId, image, client, { kosOwnerId, kosName });
        }));
        console.log('4');
      }
      await client.query('COMMIT');

      return rows[0].id;
    } catch (error) {
      await client.query('ROLLBACK');
      throw new InvariantError(error.message);
    }
  }

  async writeAndCommitImageDatabase(kosId, image, client, { kosOwnerId, kosName }) {
    // const filename = +new Date() + image.hapi.filename;
    const filename = `${kosOwnerId}_${kosName}_${image.hapi.filename}`;
    console.log(filename);
    await this.addImageKos(kosId, filename, { pool: client });
    // await this.addImageKos('kosId', filename, client);
    await this._storageService.writeFile(image, filename, 'koss');
    console.log('oi');
  }

  // eslint-disable-next-line class-methods-use-this
  // async addImageKos(kosId, filename, client) {
  async addImageKos(kosId, filename, { pool = this._pool } = {}) {
    const id = `img_kos-${nanoid(16)}`;
    console.log(id);
    console.log(kosId);
    const query = {
      text: 'INSERT INTO image_koss values($1, $2, $3) RETURNING id',
      values: [id, kosId, filename],
    };

    const { rows } = await pool.query(query);
    // console.log(pool);
    // const { rows } = await client.query(query);
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
    // const client = await this._pool.connect();
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
      text: 'DELETE FROM image_koss where id = $1 RETURNING id',
      values: [id],
    };

    const { rows } = await this._pool.query(query);
    if (!rows[0].id) {
      throw new NotFoundError('Image gagal dihapus. Id tidak ditemukan');
    }
  }
}

module.exports = KossService;
