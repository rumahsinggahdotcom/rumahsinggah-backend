/* eslint-disable camelcase */

// exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('koss', {
    id: {
      type: 'VARCHAR',
      primaryKey: true,
    },
    owner_id: {
      type: 'VARCHAR',
      notNull: true,
    },
    users_id: {
      type: 'VARCHAR',
      notNull: true,
    },
    name: {
      type: 'VARCHAR',
      notNull: true,
    },
    address: {
      type: 'VARCHAR',
      notNull: true,
    },
    rating: {
      type: 'FLOAT',
      notNull: true,
    },
    photos: {
      type: 'VARCHAR',
      notNull: true,
    },
  });

  pgm.addConstraint('koss', 'fk_koss.users_id_users.id', 'FOREIGN KEY(users_id) REFERENCES users(id) ON DELETE CASCADE');
  pgm.addConstraint('koss', 'fk_koss.owner_id_owners.id', 'FOREIGN KEY(owner_id) REFERENCES owners(id) ON DELETE CASCADE');
};

exports.down = (pgm) => {
  // pgm.dropConstraint('koss', 'fk_koss_pemilik_id_pemilik_koss.id');
  // pgm.dropConstraint('koss', 'fk_koss_users_id_users.id');
  pgm.dropTable('koss');
};
