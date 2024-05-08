const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../exceptions/InvariantError');
const NotFoundError = require('../exceptions/NotFoundError');
const AuthenticationError = require('../exceptions/AuthenticationError');
const { mapDBToModel } = require('../utils');

class KossService {
  constructor(storageService) {
    this._pool = new Pool();
    this._storageService = storageService;
    // this._cacheService = cacheService;
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
      // await this._cacheService.delete('koss');
      // await this._cacheService.delete(`kosId:${id}`);
      // await this._cacheService.delete(`ownerkoss:${ownerId}`);
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
      // await this._cacheService.delete('koss');
      // await this._cacheService.delete(`kosId:${id}`);
      // await this._cacheService.delete(`ownerkoss:${ownerId}`);

      return imgsId;
    } catch (error) {
      await client.query('ROLLBACK');
      throw new InvariantError(error.message);
    }
  }

  async storeImgKossToStorageDb(kosId, image, { client = this._pool } = {}) {
    const imageFilename = +new Date() + image.hapi.filename;
    
    let pathImageFile
    if (process.env.NODE_ENV == "production"){
      pathImageFile = `https://${process.env.HOST}:${process.env.PORT}/file/koss/${imageFilename}`;
    } else {
      pathImageFile = `http://${process.env.HOST}:${process.env.PORT}/file/koss/${imageFilename}`;
    }

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
            image_id: item.image_id,
            image: item.image,
          }],
        });
      }

      return result;
    }, []);

    const koss = groupedData.map(mapDBToModel);
    // await this._cacheService.set('koss', JSON.stringify(koss));

    return { koss };
  }

  async getKosById(kosId) {
    const queryRoomsKos = {
      text: `SELECT r.id AS room_id, r.type, r.price, i.id as image_room_id, i.image
      FROM rooms AS r
      LEFT JOIN image_rooms AS i
      ON r.id = i.room_id
      WHERE r.kos_id = $1`,
      values: [kosId],
    };

    const { rows } = await this._pool.query(queryRoomsKos);
    const groupedData = rows.reduce((result, item) => {
      const existingRoom = result.find(
        (groupedRoom) => groupedRoom.room_id === item.room_id,
      );
      if (existingRoom) {
        existingRoom.image.push({
          image_room_id: item.image_room_id,
          image: item.image,
        });
      } else {
        result.push({
          room_id: item.room_id,
          type: item.type,
          price: item.price,
          image: [{
            image_room_id: item.image_room_id,
            image: item.image,
          }],
        });
      }
      return result;
    }, []);

    const rooms = groupedData.map(mapDBToModel);
    console.log('rooms', rooms);
    const queryOccupants = {
      text: `SELECT r.id as room_id, b.start, b.end, b.status, u.id AS user_id, u.fullname,
        u.gender, u.phone_number
        FROM rooms AS r
        LEFT JOIN bookings AS b
        ON r.id = b.room_id
        LEFT JOIN users AS u
        ON u.id = b.user_id
        WHERE r.kos_id = $1 AND b.status = $2`,
      values: [kosId, 'paid'],
    };
    const resultQueryOccupants = await this._pool.query(queryOccupants);
    console.log('resultQueryOccupants.rows', resultQueryOccupants.rows);
    const roomMerged = [];
    for (let i = 0; i < rooms.length; i += 1) {
      roomMerged.push({
        ...rooms[i],
        occupants: resultQueryOccupants.rows.filter(
          (occupant) => occupant.room_id === rooms[i].roomId,
        ),
      });
    }

    console.log('roomMerged', roomMerged);
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
    // kos.rooms = rooms;
    kos.rooms = roomMerged;
    kos.image = resultImageKos.rows;

    // await this._cacheService.set(`kosId:${kosId}`, JSON.stringify(kos));
    console.log('kos', kos);
    return { kos };
    // try {
    //   const kos = await this._cacheService.get(`kosId:${kosId}`);
    //   return {
    //     kos,
    //     isCache: 1,
    //   };
    // } catch (error) {
      
    // }
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
    // await this._cacheService.delete('koss');
    // await this._cacheService.delete(`kosId:${id}`);
    // await this._cacheService.delete(`ownerkoss:${rows[0].owner_id}`);
  }

  async delImageKosById(kosId, imageId) {
    const query = {
      text: 'DELETE FROM image_koss WHERE kos_id = $1 AND id = $2 RETURNING id, image',
      values: [kosId, imageId],
    };

    const { rows } = await this._pool.query(query);
    if (!rows.length) {
      throw new NotFoundError('Image gagal dihapus. Id tidak ditemukan');
    }

    const pathImageFile = rows[0].image;
    const filename = pathImageFile.match(/koss\/(.*)/)[1];

    try {
      await this._storageService.deleteFile(filename, 'koss');
    } catch (err) {
      console.log('Image tidak ditemukan di storage, message: ', err.message);
    }

    // await this._cacheService.delete('koss');
    // await this._cacheService.delete(`kosId:${kosId}`);
  }

  async getOwnerKoss({ owner }) {
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

    // await this._cacheService.set(`ownerkoss:${owner}`, JSON.stringify(groupedData));

    return { ownerKoss: groupedData };
    // try {
    //   const koss = await this._cacheService.get(`ownerkoss:${owner}`);
    //   return {
    //     ownerKoss: koss,
    //     isCache: 1,
    //   };
    // } catch (error) {
      
    // }
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
