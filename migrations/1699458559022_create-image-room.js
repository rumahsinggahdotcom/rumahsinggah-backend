/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('image_room', {
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

  pgm.addConstraint('image_room', 'fk_image_room.room_id_room.id', 'FOREIGN KEY (room_id) REFERENCES room(id) ON DELETE CASCADE ON UPDATE CASCADE DEFERRABLE INITIALLY DEFERRED');
};

exports.down = (pgm) => {
  pgm.dropTable('image_room');
};
