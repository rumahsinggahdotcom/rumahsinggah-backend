/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.createTable('room_num', {
    id: {
      type: 'VARCHAR',
      primaryKey: true,
    },
    room_id: {
      type: 'VARCHAR',
      notNull: true,
    },
    number: {
      type: 'INTEGER',
      notNull: true,
    },
    status: {
      type: 'VARCHAR',
      notNull: true,
    },
  });
  pgm.addConstraint('room_num', 'fk_room_num.room_id_room.id', 'FOREIGN KEY(room_id) REFERENCES room(id) ON DELETE CASCADE');
};

exports.down = (pgm) => {
  pgm.dropTable('room_num');
};
