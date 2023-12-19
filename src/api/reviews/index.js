const reviewRoutes = require('./routes');
const ReviewHandler = require('./handler');

module.exports = {
  name: 'reviewApp',
  version: '1.0.0',
  register: async (server, { service, validator }) => {
    const reviewHandler = new ReviewHandler(service, validator);
    server.route(reviewRoutes(reviewHandler));
  },
};
