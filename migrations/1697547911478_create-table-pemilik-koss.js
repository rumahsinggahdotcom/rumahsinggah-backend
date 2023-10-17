/* eslint-disable camelcase */

// exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('pemilik_koss', {
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
    alamat: {
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
  pgm.dropTable('pemilik_koss');
};
