const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../exceptions/InvariantError');
const NotFoundError = require('../exceptions/NotFoundError');
const AuthenticationError = require('../exceptions/AuthenticationError');
const { mapDBToModel } = require('../utils');

class RoomService {
  constructor(storageService) {
    this._pool = new Pool();
    this._storageService = storageService;
    // this._cacheService = cacheService;
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
      const query = {
        text: 'INSERT INTO rooms values ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
        values: [id, kosId, type, maxPeople, price, quantity, description],
      };
      const { rows } = await client.query(query);
      const roomId = rows[0].id;

      if (!roomId) {
        throw new InvariantError('Room Kos Gagal Ditambahkan.');
      }
      if (arrayImgs.length > 0) {
        await Promise.all(arrayImgs.map(async (image) => {
          await this.storeImgRoomsToStorageDb(roomId, image, { client });
        }));
      }
      await client.query('COMMIT');
      // await this._cacheService.delete(`roomId:${roomId}`);
      // await this._cacheService.delete(`roomsKosId:${kosId}`);
      return roomId;
    } catch (error) {
      await client.query('ROLLBACK');
      throw new InvariantError(error.message);
    } finally {
      client.release();
    }
  }

  async addImageRoom(id, arrayImgs) {
    const imgsId = [];
    const client = await this._pool.connect();

    try {
      await client.query('BEGIN');
      await Promise.all(arrayImgs.map(async (image) => {
        const imgId = await this.storeImgRoomsToStorageDb(id, image, { client });
        imgsId.push(imgId);
      }));
      await client.query('COMMIT');

      const query = {
        text: 'SELECT kos_id FROM rooms WHERE id = $1',
        values: [id],
      };

      const { rows } = await client.query(query);
      const kosId = rows[0].kos_id;

      // await this._cacheService.delete(`roomId:${id}`);
      // await this._cacheService.delete(`roomsKosId:${kosId}`);

      return imgsId;
    } catch (error) {
      await client.query('ROLLBACK');
      throw new InvariantError(error.message);
    } finally {
      client.release();
    }
  }

  async storeImgRoomsToStorageDb(roomId, image, { client = this._pool } = {}) {
    const imageFilename = +new Date() + image.hapi.filename;

    await this._storageService.writeFile(image, imageFilename, 'rooms');
    await this._storageService.saveToSupabase(image, imageFilename)
    const pathImageFile = await this._storageService.getPublicUrl(imageFilename, 'rooms')

    // let pathImageFile;
    // if (process.env.NODE_ENV == "production"){
    //   pathImageFile = `https://${process.env.HOST}/file/koss/${imageFilename}`;
    // } else {
    //   pathImageFile = `http://${process.env.HOST}/file/koss/${imageFilename}`;
    // }

    const id = `image_room-${nanoid(16)}`;

    const imgRoomQuery = {
      text: 'INSERT INTO image_rooms values($1, $2, $3) RETURNING id',
      values: [id, roomId, pathImageFile],
    };
    const { rows } = await client.query(imgRoomQuery);
    if (!rows[0].id) {
      throw new InvariantError('Gagal menambahkan image room');
    }

    return rows[0].id;
  }

  async getRoomsByKosId(kosId) {
    const query = {
      text: `SELECT r.id, r.kos_id, r.type, r.max_people, r.price, r.quantity, r.description, 
      i.id as image_id, i.image 
      FROM rooms as r 
      LEFT JOIN image_rooms as i 
      ON r.id = i.room_id 
      WHERE r.kos_id = $1`,
      values: [kosId],
    };

    const { rows } = await this._pool.query(query);

    if (!rows.length) {
      throw new NotFoundError('Rooms tidak ditemukan.');
    }

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
          kos_id: item.kos_id,
          type: item.type,
          max_people: item.max_people,
          price: item.price,
          quantity: item.quantity,
          description: item.description,
          image: [{
            image_id: item.image_id,
            image: item.image,
          }],
        });
      }

      return result;
    }, []);

    const roomData = groupedData.map(mapDBToModel);
    // await this._cacheService.set(`roomsKosId:${kosId}`, JSON.stringify(roomData));
    return { rooms: roomData };
    // try {
    //   // throw new InvariantError('eaaa');
    //   const rooms = await this._cacheService.get(`roomsKosId:${kosId}`);
    //   return {
    //     rooms,
    //     isCache: 1,
    //   };
    // } catch (error) {
      
    // }
  }

  async getRoomById(id) {
    const queryRoom = {
      text: `SELECT r.id, r.kos_id, r.type, r.max_people, r.quantity, r.price, r.description, k.name
      FROM rooms as r
      LEFT JOIN koss as k
      ON r.kos_id = k.id
      WHERE r.id = $1`,
      values: [id],
    };

    const resultRoom = await this._pool.query(queryRoom);

    if (!resultRoom.rows.length) {
      throw new NotFoundError('Room tidak ditemukan.');
    }

    const queryImageroom = {
      text: 'SELECT id as image_id, image FROM image_rooms WHERE room_id = $1',
      values: [id],
    };

    const resultImageRoom = await this._pool.query(queryImageroom);

    const queryOccupantsRooms = {
      text: `SELECT b.start, b.end, b.status, u.id as user_id, u.fullname, u.gender, u.phone_number
      FROM bookings as b
      LEFT JOIN users as u
      ON b.user_id = u.id
      WHERE b.room_id = $1 AND b.status = $2`,
      values: [id, 'paid'],
    };

    const resultOccupants = await this._pool.query(queryOccupantsRooms);
    console.log('resultOccupants.rows', resultOccupants.rows);

    const roomData = resultRoom.rows[0];
    roomData.image = resultImageRoom.rows;
    roomData.occupants = resultOccupants.rows;

    // await this._cacheService.set(`roomId:${id}`, JSON.stringify(roomData));
    return { room: roomData };
    // try {
    //   const room = await this._cacheService.get(`roomId:${id}`);
    //   return {
    //     room,
    //     isCache: 1,
    //   };
    // } catch (error) {
      
    // }
  }

  async editRoomById(id, {
    type,
    maxPeople,
    price,
    quantity,
    description,
  }) {
    const query = {
      text: 'UPDATE rooms SET type = $2, max_people = $3, price = $4, quantity = $5, description = $6 WHERE id = $1 RETURNING id, kos_id',
      values: [id, type, maxPeople, price, quantity, description],
    };

    const { rows } = await this._pool.query(query);
    if (!rows.length) {
      throw new InvariantError('Gagal Memperbarui Room. Id Tidak Ditemukan.');
    }

    const kosId = rows[0].kos_id;

    // await this._cacheService.delete(`roomId:${id}`);
    // await this._cacheService.delete(`roomsKosId:${kosId}`);
  }

  async delImageRoomById(roomId, imageId) {
    const query = {
      text: 'DELETE FROM image_rooms WHERE room_id = $1 AND id = $2 RETURNING id, image',
      values: [roomId, imageId],
    };

    const { rows } = await this._pool.query(query);
    if (!rows.length) {
      throw new InvariantError('Gagal menghapus image. Id tidak ditemukan.');
    }

    const pathImageFile = rows[0].image;
    const filename = pathImageFile.match(/rooms\/(.*)/)[1];
    try {
      await this._storageService.deleteFile(filename, 'rooms');
    } catch (err) {
      console.log('Image tidak ditemukan di storage, message: ', err.message);
    }

    const kosIdQuery = {
      text: 'SELECT kos_id FROM rooms WHERE id = $1',
      values: [roomId],
    };

    const resultKosId = await this._pool.query(kosIdQuery);
    const kosId = resultKosId.rows[0].kos_id;

    // await this._cacheService.delete(`roomId:${roomId}`);
    // await this._cacheService.delete(`roomsKosId:${kosId}`);
  }

  async getPriceByRoomId(id, duration) {
    const query = {
      text: 'SELECT price FROM rooms WHERE id = $1',
      values: [id],
    };

    const { rows } = await this._pool.query(query);

    if (!rows.length) {
      throw new NotFoundError('Room tidak ditemukan.');
    }

    let priceRoom = rows[0].price;
    if (duration) {
      if (duration === 12 || duration === 6) {
        priceRoom *= duration / 6;
      } else {
        throw new InvariantError('Durasi tidak tersedia');
      }
    }

    return priceRoom;
  }

  async getRoomDetailMidtransById(id) {
    const query = {
      text: `SELECT r.type, k.name 
      FROM rooms AS r 
      INNER JOIN koss AS k 
      ON r.kos_id = k.id 
      WHERE r.id = $1`,
      values: [id],
    };

    const { rows } = await this._pool.query(query);
    if (!rows.length) {
      throw new NotFoundError('Room tidak ditemukan');
    }

    const { type, name } = rows[0];

    return { type, name };
  }

  async editRoomQuantityById(id, quantity) {
    const query = {
      text: 'UPDATE rooms SET quantity = quantity - $2 WHERE id = $1 RETURNING id',
      values: [id, quantity],
    };

    const { rows } = await this._pool.query(query);
    console.log(rows);

    if (!rows[0].id) {
      throw new InvariantError('Gagal memperbarui jumlah room. Room tidak ditemukan');
    }
  }

  async verifyRoomAccess(roomId, credentialId) {
    const query = {
      text: 'SELECT k.owner_id FROM koss as k LEFT JOIN rooms as r ON k.id = r.kos_id WHERE r.id = $1',
      values: [roomId],
    };

    const { rows } = await this._pool.query(query);

    if (!rows.length) {
      throw new InvariantError('Room tidak ditemukan.');
    }

    const kos = rows[0];

    if (kos.owner_id !== credentialId) {
      throw new AuthenticationError('Anda tidak berhak mengakses resource ini.');
    }
  }

  async verifyRoomsOwner(roomId, ownerId) {
    const query = {
      text: `SELECT r.id, k.owner_id 
      FROM rooms as r 
      INNER JOIN koss as k 
      ON r.kos_id = k.id 
      WHERE r.id = $1`,
      values: [roomId],
    };

    const { rows } = await this._pool.query(query);
    if (!rows.length) {
      throw new InvariantError('Room tidak ditemukan');
    }

    if (ownerId !== rows[0].owner_id) {
      throw new InvariantError('Kamar dan pemilik kamar tidak bersesuaian');
    }
  }
}
module.exports = RoomService;
