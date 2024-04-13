/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('reviews', {
    id: {
      type: 'VARCHAR',
      primaryKey: true,
    },
    user_id: {
      type: 'VARCHAR',
      notNull: true,
    },
    kos_id: {
      type: 'VARCHAR',
      notNull: true,
    },
    score: {
      type: 'INTEGER',
      notNull: true,
    },
    review: {
      type: 'VARCHAR',
      notNull: true,
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('reviews');
};
