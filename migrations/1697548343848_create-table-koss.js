/* eslint-disable camelcase */

// exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('koss', {
    kos_id: {
      type: 'VARCHAR',
      primaryKey: true,
    },
    pemilik_id: {
      type: 'VARCHAR',
      notNull: true,
    },
    users_id: {
      type: 'VARCHAR',
      notNull: true,
    },
    nama_kos: {
      type: 'VARCHAR',
      notNull: true,
    },
    alamat_kos: {
      type: 'VARCHAR',
      notNull: true,
    },
    rating_kos: {
      type: 'FLOAT',
      notNull: true,
    },
    foto_kos: {
      type: 'VARCHAR',
      notNull: true,
    },
  });

  pgm.addConstraint('koss', 'fk_koss.users_id_users.id', 'FOREIGN KEY(users_id) REFERENCES users(id) ON DELETE CASCADE');
  pgm.addConstraint('koss', 'fk_koss.pemilik_id_pemilik_koss.id', 'FOREIGN KEY(pemilik_id) REFERENCES pemilik_koss(id) ON DELETE CASCADE');
};

exports.down = (pgm) => {
  // pgm.dropConstraint('koss', 'fk_koss_pemilik_id_pemilik_koss.id');
  // pgm.dropConstraint('koss', 'fk_koss_users_id_users.id');
  pgm.dropTable('koss');
};
