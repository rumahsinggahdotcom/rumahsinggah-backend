require('dotenv').config();

const hapi = require('@hapi/hapi');
// const api = require('./api');

const init = async () => {
  const server = hapi.server({
    port: 8000,
    host: process.env.NODE_ENV !== 'production' ? 'localhost' : '0.0.0.0',
  });
  await server.start();
  server.route(
    {
      method: 'GET',
      path: '/',
      handler: () => ({
        value: 'Brillianita love Arfandy',
      }),
    },
  );
  console.log('TEST');
};

init();
