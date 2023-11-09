const path = require('path');
const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../exceptions/InvariantError');
const NotFoundError = require('../exceptions/NotFoundError');
const StorageService = require('./StorageService');

class RoomService {
  constructor() {
    this._pool = new Pool();
    this._storageService = new StorageService(path.resolve(__dirname, '../api/room/file'));
  }

  async addRoom({
    type,
    maxPeople,
    price,
    kosId,
    quantity,
  }, arrayImgs) {
    const client = await this._pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('SET CONSTRAINTS ALL DEFERRED');
      const id = `room-${nanoid(16)}`;

      const query = {
        text: 'INSERT INTO room values ($1, $2, $3, $4, $5, $6) RETURNING id',
        values: [id, type, maxPeople, price, kosId, quantity],
      };

      const { rows } = await client.query(query);
      const roomId = rows[0].id;

      if (!roomId) {
        throw new InvariantError('Room Kos Gagal Ditambahkan.');
      }
      // console.log(roomId);
      if (arrayImgs) {
        await Promise.all(arrayImgs.map(async (image) => {
          const filename = +new Date() + image.hapi.filename;
          await this.writeAndCommitImageDatabase(roomId, image, client);
          await this._storageService.writeFile(image, filename);
          // console.log('filename :', filename);
          // await this.addImageRoom(roomId, filename);
          // const idImg = `image_room-${nanoid(16)}`;
          // console.log(idImg);
          // const queryImg = {
          //   text: 'INSERT INTO image_room values($1, $2, $3) RETURNING id',
          //   values: [idImg, roomId, filename],
          // };

          // // const { rows } = await client.query(query);
          // const resultImg = await client.query(queryImg);
          // if (!resultImg.rows[0].id) {
          //   throw new InvariantError('Gagal menambahkan image room');
          // }
        }));
      }

      await client.query('COMMIT');
      return roomId;
    } catch (error) {
      await client.query('ROLLBACK');
      throw new InvariantError(error.detail);
    }
  }

  async writeAndCommitImageDatabase(roomId, image, client) {
    const filename = +new Date() + image.hapi.filename;
    await this.addImageRoom(roomId, filename, client);
    await this._storageService.writeFile(image, filename);
  }

  async addImageRoom(roomId, filename, client) {
    const id = `image_room-${nanoid(16)}`;
    console.log(id);

    const query = {
      text: 'INSERT INTO image_room values($1, $2, $3) RETURNING id',
      values: [id, roomId, filename],
    };

    const { rows } = await client.query(query);
    // const { rows } = await this._pool.query(query);
    if (!rows[0].id) {
      throw new InvariantError('Gagal ienambahkan image room');
    }
  }

  async getRoomsByKosId(kosId) {
    const query = {
      text: 'SELECT * FROM room WHERE kos_id = $1',
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
      text: 'SELECT * FROM room WHERE id = $1',
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
  }) {
    const query = {
      text: 'UPDATE room SET type = $2, max_people = $3, price = $4, quantity = $5 WHERE id = $1 RETURNING id',
      values: [id, type, maxPeople, price, quantity],
    };

    const { rows } = await this._pool.query(query);

    if (!rows[0].id) {
      throw new InvariantError('Gagal Memperbarui Room. Id Tidak Ditemukan.');
    }

    return rows[0].id;
  }
}
module.exports = RoomService;
