const AuthHandler = require('./handler');
const authRoutes = require('./routes');

module.exports = {
  name: 'authApp',
  version: '1.0.0',
  register: async (server, {
    authService, usersService, ownersService, tokenManager, validator,
  }) => {
    const authHandler = new AuthHandler(
      authService,
      usersService,
      ownersService,
      tokenManager,
      validator,
    );
    server.route(authRoutes(authHandler));
  },
};
