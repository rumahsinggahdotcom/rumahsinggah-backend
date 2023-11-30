const KossHandler = require('./handler');
const kosRoutes = require('./routes');

module.exports = {
  name: 'kosApp',
  version: '1.0.0',
  register: async (server, {
    kossService, storageService, validator,
  }) => {
    const kossHandler = new KossHandler(kossService, storageService, validator);
    server.route(kosRoutes(kossHandler));
  },
};
