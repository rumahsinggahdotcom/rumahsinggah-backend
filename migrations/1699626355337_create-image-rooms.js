/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('image_rooms', {
    id: {
      type: 'VARCHAR',
      primaryKey: true,
    },
    room_id: {
      type: 'VARCHAR',
      notNull: true,
    },
    image: {
      type: 'VARCHAR',
      notNull: false,
    },
  });

  pgm.addConstraint('image_rooms', 'fk_image_rooms.room_id_rooms.id', 'FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE ON UPDATE CASCADE DEFERRABLE INITIALLY DEFERRED');
};

exports.down = (pgm) => {
  pgm.dropTable('image_rooms');
};
