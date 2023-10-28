const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../exceptions/InvariantError');

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
      text: 'SELECT * FROM koss LEFT JOIN image_koss ON koss.id = image_koss.kos_id',
    };
    const { rows } = await this._pool.query(query);
    console.log(rows);
    Object.values(rows.reduce((a, { kos_id, images }) => {
      console.log('a: ', a);
      console.log('kosId: ', kos_id);
      console.log('images: ', images);
      // return 'yes';
    }));
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
