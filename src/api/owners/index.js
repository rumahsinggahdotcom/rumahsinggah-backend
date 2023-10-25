const OwnersHandler = require('./handler');
const ownerRoutes = require('./routes');

module.exports = {
  name: 'ownerApp',
  version: '1.0.0',
  register: async (server, { service, validator }) => {
    const ownersHandler = new OwnersHandler(service, validator);
    server.route(ownerRoutes(ownersHandler));
  },
};
