// require('dotenv').config();

const hapi = require('@hapi/hapi');

// Owners
const ownersApp = require('./api/owners');
const OwnersService = require('./services/OwnersService');
const OwnersValidator = require('./validator/owners');

const init = async () => {
  const ownersService = new OwnersService();

  const server = hapi.server({
    port: process.env.PORT,
    host: process.env.NODE_ENV !== 'production' ? 'localhost' : '0.0.0.0',
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });
  await server.register([
    {
      plugin: ownersApp,
      options: {
        service: ownersService,
        validator: OwnersValidator,
      },
    },
  ]);

  await server.start();
  console.log('TEST');
};

init();
