/* eslint-disable camelcase */

// exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('users', {
    id: {
      type: 'VARCHAR',
      primaryKey: true,
    },
    nama_lengkap: {
      type: 'VARCHAR',
      notNull: true,
    },
    username: {
      type: 'VARCHAR',
      notNull: true,
    },
    password: {
      type: 'VARCHAR',
      notNull: true,
    },
    phone_number: {
      type: 'VARCHAR',
      notNull: true,
    },
    address: {
      type: 'VARCHAR',
      notNull: true,
    },
    gender: {
      type: 'VARCHAR',
      notNull: true,
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('users');
};
