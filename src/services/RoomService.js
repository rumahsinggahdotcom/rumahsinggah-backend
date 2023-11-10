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
      console.log('1');
      const query = {
        text: 'INSERT INTO rooms values ($1, $2, $3, $4, $5, $6) RETURNING id, type',
        values: [id, type, maxPeople, price, kosId, quantity],
      };
      const { rows } = await client.query(query);
      console.log('2');
      const roomId = rows[0].id;
      const roomType = rows[0].type;
      console.log(roomType);

      const kosQuery = {
        text: 'SELECT owner_id FROM koss WHERE id = $1',
        values: [kosId],
      };
      const resultKos = await client.query(kosQuery);
      console.log(resultKos);
      const ownerId = resultKos.rows[0].owner_id;
      console.log('3');
      if (!roomId) {
        throw new InvariantError('Room Kos Gagal Ditambahkan.');
      }
      if (arrayImgs) {
        await Promise.all(arrayImgs.map(async (image) => {
          await this.writeAndCommitImageDatabase(
            roomId,
            image,
            client,
            { ownerId, kosId, roomType },
          );
        }));
      }
      await client.query('COMMIT');
      return roomId;
    } catch (error) {
      await client.query('ROLLBACK');
      throw new InvariantError(error.detail);
    } finally {
      client.release();
    }
  }

  async writeAndCommitImageDatabase(roomId, image, client, { ownerId, kosId, roomType }) {
    // const filename = +new Date() + image.hapi.filename;
    const filename = `${ownerId}_${kosId}_${roomType}_${image.hapi.filename}`;
    await this.addImageRoom(roomId, filename, client);
    await this._storageService.writeFile(image, filename);
  }

  // eslint-disable-next-line class-methods-use-this
  async addImageRoom(roomId, filename, client) {
    const id = `image_room-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO image_rooms values($1, $2, $3) RETURNING id',
      values: [id, roomId, filename],
    };
    const { rows } = await client.query(query);
    // const { rows } = await this._pool.query(query);
    if (!rows[0].id) {
      throw new InvariantError('Gagal menambahkan image room');
    }
    // console.log('ini id di addImageRoom', rows[0].id);
    // return rows[0].id;
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
  }, arrayImgs) {
    const client = await this._pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('SET CONSTRAINTS ALL DEFERRED');
      const query = {
        text: 'UPDATE rooms SET type = $2, max_people = $3, price = $4, quantity = $5 WHERE id = $1 RETURNING id, type, kos_id',
        values: [id, type, maxPeople, price, quantity],
      };

      const { rows } = await client.query(query);
      console.log('1');
      const roomId = rows[0].id;
      const roomType = rows[0].type;
      const kosId = rows[0].kos_id;

      console.log(roomId, roomType, kosId);

      const kosQuery = {
        text: 'SELECT owner_id FROM koss WHERE id = $1',
        values: [kosId],
      };
      const resultKos = await client.query(kosQuery);
      console.log('2');
      // console.log(resultKos);
      const ownerId = resultKos.rows[0].owner_id;
      console.log(ownerId);

      if (!roomId) {
        throw new InvariantError('Gagal Memperbarui Room. Id Tidak Ditemukan.');
      }

      const roomImgsQuery = {
        text: 'SELECT image FROM image_rooms WHERE room_id = $1',
        values: [roomId],
      };
      const resultRoomImgs = await client.query(roomImgsQuery);
      console.log('3');
      const roomImgs = resultRoomImgs.rows;

      if (roomImgs) {
        const delImgQuery = {
          text: 'DELETE FROM image_rooms WHERE room_id = $1',
          values: [roomId],
        };
        await client.query(delImgQuery);
        console.log('4');
        await Promise.all(roomImgs.map(async (imgFilename) => {
          await this._storageService.deleteFile(imgFilename.image);
        }));
        console.log('5');
      }

      if (arrayImgs) {
        await Promise.all(arrayImgs.map(async (image) => {
          await this.writeAndCommitImageDatabase(
            roomId,
            image,
            client,
            { ownerId, kosId, roomType },
          );
          console.log('6');
          // const filename = +new Date() + image.hapi.filename;
          // const idImg = `image_room-${nanoid(16)}`;
          // const queryImg = {
          //   text: 'INSERT INTO image_room values($1, $2, $3) RETURNING id',
          //   values: [idImg, 'roomId', filename],
          // };
          // const resultImg = await client.query(queryImg);
          // if (!resultImg.rows[0].id) {
          //   throw new InvariantError('Gagal menambahkan image room');
          // }

          // await this._storageService.writeFile(image, filename);
        }));
      }
      await client.query('COMMIT');

      return roomId;
    } catch (error) {
      await client.query('ROLLBACK');
      throw new InvariantError(error.detail);
    }
  }
}
module.exports = RoomService;
