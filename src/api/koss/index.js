const KossHandler = require('./handler');
const kosRoutes = require('./routes');

module.exports = {
  name: 'kosApp',
  version: '1.0.0',
  register: async (server, {
    kossService, imageKossService, storageService, validator,
  }) => {
    const kosHandler = new KossHandler(kossService, imageKossService, storageService, validator);
    server.route(kosRoutes(kosHandler));
  },
};
