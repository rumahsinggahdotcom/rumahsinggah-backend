/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('image_koss', {
    id: {
      type: 'VARCHAR',
      primaryKey: true,
    },
    kos_id: {
      type: 'VARCHAR',
      notNull: true,
    },
    image: {
      type: 'VARCHAR',
      notNull: false,
    },
  });

  pgm.addConstraint('image_koss', 'fk_image_koss.kos_id_koss.id', 'FOREIGN KEY (kos_id) REFERENCES koss(id) ON DELETE CASCADE ON UPDATE CASCADE DEFERRABLE INITIALLY DEFERRED');
};

exports.down = (pgm) => {
  pgm.dropTable('image_koss');
};
