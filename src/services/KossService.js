const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../exceptions/InvariantError');
const NotFoundError = require('../exceptions/NotFoundError');
const AuthenticationError = require('../exceptions/AuthenticationError');
const { mapDBToModel } = require('../utils');

class KossService {
  constructor(cacheService, storageService) {
    this._pool = new Pool();
    this._storageService = storageService;
    this._cacheService = cacheService;
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
        text: 'INSERT INTO koss values($1, $2, $3, $4, $5) RETURNING id',
        values: [id, ownerId, name, address, description],
      };
      const { rows } = await client.query(query);
      if (!rows[0].id) {
        throw new InvariantError('Kos Gagal Ditambahkan.');
      }
      const kosId = rows[0].id;

      if (arrayImgs.length > 0) {
        await Promise.all(arrayImgs.map(async (image) => {
          await this.storeImgKossToStorageDb(kosId, image, { client });
        }));
      }
      await client.query('COMMIT');
      await this._cacheService.delete('koss');
      await this._cacheService.delete(`kosId:${id}`);
      await this._cacheService.delete(`ownerkoss:${ownerId}`);
      return rows[0].id;
    } catch (error) {
      await client.query('ROLLBACK');
      throw new InvariantError(error.message);
    }
  }

  async addImageKos(id, arrayImgs, ownerId) {
    const imgsId = [];
    const client = await this._pool.connect();
    try {
      await client.query('BEGIN');

      if (arrayImgs.length > 0) {
        await Promise.all(arrayImgs.map(async (image) => {
          const imgId = await this.storeImgKossToStorageDb(id, image, { client });
          imgsId.push(imgId);
        }));
      }
      await client.query('COMMIT');
      await this._cacheService.delete('koss');
      await this._cacheService.delete(`kosId:${id}`);
      await this._cacheService.delete(`ownerkoss:${ownerId}`);

      return imgsId;
    } catch (error) {
      await client.query('ROLLBACK');
      throw new InvariantError(error.message);
    }
  }

  async storeImgKossToStorageDb(kosId, image, { client = this._pool } = {}) {
    const imageFilename = +new Date() + image.hapi.filename;
    const pathImageFile = `http://${process.env.HOST}:${process.env.PORT}/file/koss/${imageFilename}`;

    const id = `img_kos-${nanoid(16)}`;
    const imgKosQuery = {
      text: 'INSERT INTO image_koss values($1, $2, $3) RETURNING id',
      values: [id, kosId, pathImageFile],
    };

    const resImgKos = await client.query(imgKosQuery);
    if (!resImgKos.rows[0].id) {
      throw new InvariantError('Image Kos Gagal Ditambahkan.');
    }

    await this._storageService.writeFile(image, imageFilename, 'koss');
    return resImgKos.rows[0].id;
  }

  async getKoss() {
    try {
      const koss = await this._cacheService.get('koss');
      return {
        koss,
        isCache: 1,
      };
    } catch (error) {
      const query = {
        text: `SELECT k.id, k.owner_id, k.name, k.address, k.description, i.id as image_id, i.image 
        FROM koss AS k 
        LEFT JOIN image_koss AS i 
        ON k.id = i.kos_id`,
      };

      const { rows } = await this._pool.query(query);

      const groupedData = rows.reduce((result, item) => {
        const existingItem = result.find((groupedItem) => groupedItem.id === item.id);

        if (existingItem) {
          existingItem.image.push({
            image_id: item.image_id,
            image: item.image,
          });
        } else {
          result.push({
            id: item.id,
            owner_id: item.owner_id,
            name: item.name,
            address: item.address,
            description: item.description,
            image: [{
              image_id: item.id,
              image: item.image,
            }],
          });
        }

        return result;
      }, []);

      const koss = groupedData.map(mapDBToModel);
      await this._cacheService.set('koss', JSON.stringify(koss));

      return { koss };
    }
  }

  async getKosById(kosId) {
    try {
      const kos = await this._cacheService.get(`kosId:${kosId}`);
      return {
        kos,
        isCache: 1,
      };
    } catch (error) {
      const queryImageKos = {
        text: 'SELECT id as image_id, image FROM image_koss WHERE kos_id = $1',
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

      await this._cacheService.set(`kosId:${kosId}`, JSON.stringify(kos));
      return { kos };
    }
  }

  async editKosById(id, {
    name,
    address,
    description,
  }) {
    const query = {
      text: 'UPDATE koss SET name = $2, address = $3, description = $4 WHERE id = $1 RETURNING id, owner_id',
      values: [id, name, address, description],
    };

    const { rows } = await this._pool.query(query);
    if (!rows[0].id) {
      throw new InvariantError('Gagal memperbarui Kos. Id tidak ditemukan.');
    }
    await this._cacheService.delete('koss');
    await this._cacheService.delete(`kosId:${id}`);
    await this._cacheService.delete(`ownerkoss:${rows[0].owner_id}`);
  }

  async delImageKosById(id, imageId) {
    const query = {
      text: 'DELETE FROM image_koss WHERE kos_id = $1 AND id = $2 RETURNING id, image',
      values: [id, imageId],
    };

    const { rows } = await this._pool.query(query);
    const filename = rows[0].image;

    if (!rows[0].id) {
      throw new NotFoundError('Image gagal dihapus. Id tidak ditemukan');
    }
    await this._cacheService.delete('koss');
    await this._cacheService.delete(`kosId:${id}`);
    return filename;
  }

  async getOwnerKoss({ owner }) {
    try {
      const koss = await this._cacheService.get(`ownerkoss:${owner}`);
      return {
        ownerKoss: koss,
        isCache: 1,
      };
    } catch (error) {
      const query = {
        text: 'SELECT k.id, k.owner_id, k.name, k.address, k.description, i.image FROM koss as k LEFT JOIN image_koss as i ON k.id = i.kos_id WHERE k.owner_id = $1',
        values: [owner],
      };

      const { rows } = await this._pool.query(query);

      if (!rows.length) {
        throw new InvariantError('Kos tidak ditemukan');
      }

      const groupedData = rows.reduce((result, item) => {
        const existingItem = result.find((resultData) => resultData.id === item.id);
        if (existingItem) {
          existingItem.image.push({ image: item.image });
        } else {
          result.push({
            id: item.id,
            owner_id: item.owner_id,
            name: item.name,
            address: item.address,
            description: item.description,
            image: [{ image: item.image }],
          });
        }

        return result;
      }, []);

      await this._cacheService.set(`ownerkoss:${owner}`, JSON.stringify(groupedData));

      return { ownerKoss: groupedData };
    }
  }

  async verifyKosAccess(id, credentialId) {
    const query = {
      text: 'SELECT id, owner_id FROM koss WHERE id = $1',
      values: [id],
    };

    const { rows } = await this._pool.query(query);
    if (!rows.length) {
      throw new NotFoundError('Kos tidak ditemukan');
    }

    const kos = rows[0];

    if (kos.owner_id !== credentialId) {
      throw new AuthenticationError('Anda tidak berhak mengakses resource ini.');
    }
  }
}

module.exports = KossService;
