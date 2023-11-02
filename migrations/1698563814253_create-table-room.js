/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.createTable('room', {
    id: {
      type: 'VARCHAR',
      primaryKey: true,
    },
    type: {
      type: 'VARCHAR',
      notNull: true,
    },
    max_people: {
      type: 'VARCHAR',
      notNull: true,
    },
    price: {
      type: 'INTEGER',
      notNull: true,
    },
    kos_id: {
      type: 'VARCHAR',
      notNull: true,
    },
    quantity: {
      type: 'INTEGER',
      notNull: true,
    },
  });

  pgm.addConstraint('room', 'fk_room.kos_id_koss.id', 'FOREIGN KEY (kos_id) REFERENCES koss(id) ON DELETE CASCADE');
};

exports.down = (pgm) => {
  pgm.dropTable('room');
};
