const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../exceptions/InvariantError');
const { mapDBToModel } = require('../utils');

class KossService {
  constructor() {
    this._pool = new Pool();
  }

  async addKos({
    ownerId,
    name,
    address,
  }) {
    const id = `koss-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO koss values($1, $2, $3, $4, $5, $6) RETURNING id',
      values: [id, ownerId, null, name, address, null],
    };

    const { rows } = await this._pool.query(query);

    if (!rows[0].id) {
      throw new InvariantError('Kos Gagal Ditambahkan.');
    }

    return rows[0].id;
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
    // const query = {
    //   text: 'SELECT * FROM koss LEFT JOIN image_koss ON koss.id = image_koss.kos_id',
    // };
    // const { rows } = await this._pool.query(query);
    // console.log(rows);
    // Object.values(rows.reduce((a, { kos_id, images }) => {
    //   console.log('a: ', a);
    //   console.log('kosId: ', kos_id);
    //   console.log('images: ', images);
    //   // return 'yes';
    // }));
    // const resultKos = await this._pool.query(queryKos);

    // const queryImageKos = {
    //   text: 'SELECT * FROM image_koss',
    // };

    // const resultImageKos = await this._pool.query(queryKos);

    //   if (!rows.length) {
    //     throw new InvariantError('Kos Tidak Ditemukan.');
    //   }
    //   // console.log(rows);
    //   return rows;
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
    const kos = resultKos.rows[0];
    kos.image = resultImageKos.rows;

    console.log(kos);

    // console.log(result);

    // if (!rows.length) {
    //   throw new InvariantError('Kos tidak ditemukan.');
    // }

    // return rows;
  }
}

module.exports = KossService;
