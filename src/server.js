const hapi = require('@hapi/hapi');

const init = async () => {
  const server = hapi.server({
    port: 8080,
    host: 'localhost',
  });
  await server.start();
  console.log('TEST');
};

init();
