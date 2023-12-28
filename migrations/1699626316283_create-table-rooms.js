/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.createTable('rooms', {
    id: {
      type: 'VARCHAR',
      primaryKey: true,
    },
    kos_id: {
      type: 'VARCHAR',
      notNull: true,
    },
    type: {
      type: 'VARCHAR',
      notNull: true,
    },
    max_people: {
      type: 'INTEGER',
      notNull: true,
    },
    price: {
      type: 'INTEGER',
      notNull: true,
    },
    quantity: {
      type: 'INTEGER',
      notNull: true,
    },
    description: {
      type: 'VARCHAR',
      notNull: true,
    },
  });

  pgm.addConstraint('rooms', 'fk_rooms.kos_id_koss.id', 'FOREIGN KEY (kos_id) REFERENCES koss(id) ON DELETE CASCADE');
};

exports.down = (pgm) => {
  pgm.dropTable('rooms');
};
