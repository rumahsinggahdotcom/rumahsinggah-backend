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
    name: {
      type: 'VARCHAR',
      notNull: true,
    },
    address: {
      type: 'VARCHAR',
      notNull: true,
    },
    description: {
      type: 'VARCHAR',
      notNull: true,
    },
  });
  pgm.addConstraint('koss', 'fk_koss.owner_id_owners.id', 'FOREIGN KEY(owner_id) REFERENCES owners(id) ON DELETE CASCADE');
};

exports.down = (pgm) => {
  pgm.dropTable('koss');
};
