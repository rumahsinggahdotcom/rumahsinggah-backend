const RoomsHandler = require('./handler');
const roomRoutes = require('./routes');

module.exports = {
  name: 'roomApp',
  version: '1.0.0',
  register: async (server, { roomsService, storageService, validator }) => {
    const roomsHandler = new RoomsHandler(roomsService, storageService, validator);
    server.route(roomRoutes(roomsHandler));
  },
};
