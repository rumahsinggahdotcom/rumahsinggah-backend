/* eslint-disable camelcase */
exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.addColumn('bookings', {
    note: {
      type: 'VARCHAR',
    },
  });
};

exports.down = (pgm) => {
  pgm.dropColumn('bookings', 'note');
};
