const RoomHandler = require('./handler');
const roomRoutes = require('./routes');

module.exports = {
  name: 'roomApp',
  version: '1.0.0',
  register: async (server, { service, validator }) => {
    const roomHandler = new RoomHandler({ service, validator });
    server.route(roomRoutes(roomHandler));
  },
};
