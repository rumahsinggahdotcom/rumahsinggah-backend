const bookingRoutes = require('./routes');
const BookingHandler = require('./handler');

module.exports = {
  name: 'bookingApp',
  version: '1.0.0',
  register: async (server, { service, validator }) => {
    const bookingHandler = new BookingHandler(service, validator);
    server.route(bookingRoutes(bookingHandler));
  },
};
