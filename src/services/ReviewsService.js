const { Pool } = require('pg');
const nanoid = require('nanoid');
const InvariantError = require('../exceptions/InvariantError');
const NotFoundError = require('../exceptions/NotFoundError');
const mapDBToModel = require('../utils');

class ReviewsService {
  constructor() {
    this._pool = new Pool();
  }

  async addReview({
    userId,
    roomId,
    score,
    review,
  }) {
    const id = `review-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO reviews values ($1, $2, $3, $4, $5) RETURNING id',
      values: [id, userId, roomId, score, review],
    };
    const { rows } = await this._pool.query(query);

    if (!rows[0].id) {
      throw new InvariantError('Gagal menambahkan review');
    }

    return rows[0].id;
  }

  async getReviewsById(id) {
    const query = {
      text: 'SELECT * FROM reviews WHERE id = $1',
      values: [id],
    };

    const { rows } = await this._pool.query(query);

    if (!rows.length) {
      throw new NotFoundError('Gagal mendapatkan review. review tidak ditemukan');
    }

    return rows.map(mapDBToModel)[0];
  }
}

module.exports = ReviewsService;
