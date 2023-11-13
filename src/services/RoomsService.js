const path = require('path');
const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../exceptions/InvariantError');
const NotFoundError = require('../exceptions/NotFoundError');
const StorageService = require('./StorageService');

class RoomService {
  constructor() {
    this._pool = new Pool();
    this._storageService = new StorageService(path.resolve(__dirname, '../api/file'));
  }

  async addRoom({
    kosId,
    type,
    maxPeople,
    price,
    quantity,
    description,
  }, arrayImgs) {
    const client = await this._pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('SET CONSTRAINTS ALL DEFERRED');
      const id = `room-${nanoid(16)}`;
      console.log('1');
      const query = {
        text: 'INSERT INTO rooms values ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
        values: [id, kosId, type, maxPeople, price, quantity, description],
      };
      const { rows } = await client.query(query);
      console.log('2');
      const roomId = rows[0].id;

      if (!roomId) {
        throw new InvariantError('Room Kos Gagal Ditambahkan.');
      }
      if (arrayImgs) {
        await Promise.all(arrayImgs.map(async (image) => {
          await this.storeImgRoomsToStorageDb(roomId, image, { client });
        }));
      }
      await client.query('COMMIT');
      return roomId;
    } catch (error) {
      await client.query('ROLLBACK');
      throw new InvariantError(error.message);
    } finally {
      client.release();
    }
  }

  async addImageRoom(roomId, arrayImgs) {
    const imgsId = [];
    const client = await this._pool.connect();

    try {
      await client.query('BEGIN');

      await Promise.all(arrayImgs.map(async (image) => {
        const imgId = await this.storeImgRoomsToStorageDb(roomId, image, { client });
        imgsId.push(imgId);
      }));

      await client.query('COMMIT');

      return imgsId;
    } catch (error) {
      await client.query('ROLLBACK');
      throw new InvariantError(error.message);
    } finally {
      client.release();
    }
  }

  async storeImgRoomsToStorageDb(roomId, image, { client = this._pool } = {}) {
    const roomQuery = {
      text: 'SELECT kos_id, type FROM rooms WHERE id = $1',
      values: [roomId],
    };
    const resultRoom = await client.query(roomQuery);
    console.log(resultRoom);
    console.log('oiiii1');
    const kosId = resultRoom.rows[0].kos_id;
    console.log('oiiii2');
    const roomType = resultRoom.rows[0].type;
    const filename = `${kosId}_${roomType}_${image.hapi.filename}`;
    const id = `image_room-${nanoid(16)}`;

    const imgRoomQuery = {
      text: 'INSERT INTO image_rooms values($1, $2, $3) RETURNING id',
      values: [id, roomId, filename],
    };
    const { rows } = await client.query(imgRoomQuery);
    if (!rows[0].id) {
      throw new InvariantError('Gagal menambahkan image room');
    }
    await this._storageService.writeFile(image, filename, 'rooms');

    return rows[0].id;
  }

  async getRoomsByKosId(kosId) {
    const query = {
      text: 'SELECT * FROM rooms WHERE kos_id = $1',
      values: [kosId],
    };

    const { rows } = await this._pool.query(query);

    if (!rows.length) {
      throw new NotFoundError('Rooms tidak ditemukan.');
    }

    return rows;
  }

  async getRoomById(id) {
    const query = {
      text: 'SELECT * FROM rooms WHERE id = $1',
      values: [id],
    };

    const { rows } = await this._pool.query(query);

    if (!rows.length) {
      throw new NotFoundError('Room tidak ditemukan.');
    }

    return rows;
  }

  async editRoomById(id, {
    type,
    maxPeople,
    price,
    quantity,
    description,
  }) {
    const query = {
      text: 'UPDATE rooms SET type = $2, max_people = $3, price = $4, quantity = $5, description = $6 WHERE id = $1 RETURNING id',
      values: [id, type, maxPeople, price, quantity, description],
    };

    const { rows } = await this._pool.query(query);
    if (!rows.length) {
      throw new InvariantError('Gagal Memperbarui Room. Id Tidak Ditemukan.');
    }
  }

  async delImageRoomById(id) {
    const query = {
      text: 'DELETE FROM image_rooms WHERE id = $1 RETURNING id, image',
      values: [id],
    };

    const { rows } = await this._pool.query(query);
    const filename = rows[0].image;

    if (!rows.length) {
      throw new InvariantError('Gagal menghapus image. Id tidak ditemukan.');
    }

    return filename;
  }
}
module.exports = RoomService;
