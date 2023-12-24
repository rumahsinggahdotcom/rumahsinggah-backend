const KossHandler = require('./handler');
const kosRoutes = require('./routes');

module.exports = {
  name: 'kosApp',
  version: '1.0.0',
  register: async (server, {
    kossService, ownersService, storageService, validator,
  }) => {
    const kossHandler = new KossHandler(kossService, ownersService, storageService, validator);
    server.route(kosRoutes(kossHandler));
  },
};
