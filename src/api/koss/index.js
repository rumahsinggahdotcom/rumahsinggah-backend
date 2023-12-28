const KossHandler = require('./handler');
const kosRoutes = require('./routes');

module.exports = {
  name: 'kosApp',
  version: '1.0.0',
  register: async (server, {
    kossService, ownersService, validator,
  }) => {
    const kossHandler = new KossHandler(kossService, ownersService, validator);
    server.route(kosRoutes(kossHandler));
  },
};
