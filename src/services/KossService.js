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
  }, arrayImgs) {
    const id = `koss-${nanoid(16)}`;

    try {
      await this._pool.query('BEGIN');

      const query = {
        text: 'INSERT INTO koss values($1, $2, $3, $4, $5) RETURNING id',
        values: [id, ownerId, name, address, null],
      };
      const { rows } = await this._pool.query(query);
      if (!rows[0].id) {
        throw new InvariantError('Kos Gagal Ditambahkan.');
      }
      const kosId = rows[0].id;

      if (arrayImgs) {
        await Promise.all(arrayImgs.map(async (image) => {
          console.log(image);
          await this.writeAndCommitImageDatabase(kosId, image);
        }));
      }

      return rows[0].id;
    } catch (error) {
      await this._pool.query('ROLLBACK');
      throw new InvariantError(error.detail);
    }
  }

  async writeAndCommitImageDatabase(kosId, image) {
    const filename = +new Date() + image.hapi.filename;
    await this.addImageKos(kosId, filename);
    await this._pool.query('COMMIT');
    await this._storageService.writeFile(image, filename);
  }

  async addImageKos(kosId, filename) {
    const id = `img_kos-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO image_koss values($1, $2, $3) RETURNING id',
      values: [id, kosId, filename],
    };

    const { rows } = await this._pool.query(query);

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

  async editKosById(kosId, {
    name,
    address,
  }, arrayImgs) {
    try {
      await this._pool.query('BEGIN');

      // Updating Koss
      const editQuery = {
        text: 'UPDATE koss SET name = $2, address = $3 WHERE id = $1',
        values: [kosId, name, address],
      };

      const resultEdit = await this._pool.query(editQuery);
      if (!resultEdit.rows) {
        throw new InvariantError('Gagal memperbarui Kos. Id tidak ditemukan.');
      }

      // Select Images from kos_id in image_koss
      const imagesQuery = {
        text: 'SELECT image FROM image_koss where kos_id = $1',
        values: [kosId],
      };
      const resultImgs = await this._pool.query(imagesQuery);
      const kosImgs = resultImgs.rows;

      // Delete File in Storage and image_koss table
      if (kosImgs) {
        await Promise.all(kosImgs.map(async (imgFilename) => {
          await this._storageService.deleteFile(imgFilename.image);
        }));
        await this.delImageKosByKosId(kosId);
      }

      // Adding Image
      if (arrayImgs) {
        await Promise.all(arrayImgs.map(async (image) => {
          await this.writeAndCommitImageDatabase(kosId, image);
        }));
      }
    } catch (error) {
      await this._pool.query('ROLLBACK');
      throw new InvariantError(error.detail);
    }
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
