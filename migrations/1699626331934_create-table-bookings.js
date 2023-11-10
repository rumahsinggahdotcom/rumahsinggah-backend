/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.createTable('bookings', {
    id: {
      type: 'VARCHAR',
      primaryKey: true,
    },
    room_id: {
      type: 'VARCHAR',
      notNull: true,
    },
    user_id: {
      type: 'VARCHAR',
      notNull: true,
    },
    start: {
      type: 'DATE',
      notNull: true,
    },
    end: {
      type: 'DATE',
      notNull: true,
    },
    owner_id: {
      type: 'VARCHAR',
      notNull: true,
    },
    status: {
      type: 'VARCHAR',
      notNull: true,
    },
  });

  pgm.addConstraint('bookings', 'fk_bookings.room_id_rooms_.id', 'FOREIGN KEY(room_id) REFERENCES rooms(id) ON DELETE CASCADE');
  pgm.addConstraint('bookings', 'fk_bookings.user_id_users.id', 'FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE');
  pgm.addConstraint('bookings', 'fk_bookings.owner_id_owners.id', 'FOREIGN KEY(owner_id) REFERENCES owners(id) ON DELETE CASCADE');
};

exports.down = (pgm) => {
  pgm.dropTable('bookings');
};
