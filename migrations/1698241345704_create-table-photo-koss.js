/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('photo_koss', {
    id: {
      type: 'VARCHAR',
      primaryKey: true,
    },
    kos_id: {
      type: 'VARCHAR',
      notNull: true,
    },
    photos: {
      type: 'VARCHAR',
      notNull: false,
    },
  });

  pgm.addConstraint('photo_koss', 'fk_photo_koss.kos_id_koss.id', 'FOREIGN KEY (kos_id) REFERENCES koss(id) ON DELETE CASCADE');
};

exports.down = (pgm) => {
  pgm.dropTable('photo_koss');
};
