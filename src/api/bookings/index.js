const bookingRoutes = require('./routes');
const BookingHandler = require('./handler');

module.exports = {
  name: 'bookingApp',
  version: '1.0.0',
  register: async (server, {
    bookingsService,
    usersService,
    roomsService,
    validator,
  }) => {
    const bookingHandler = new BookingHandler(
      bookingsService,
      usersService,
      roomsService,
      validator,
    );
    server.route(bookingRoutes(bookingHandler));
  },
};
