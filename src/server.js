require('dotenv').config();
const hapi = require('@hapi/hapi');
const path = require('path');
const ClientError = require('./exceptions/ClientError');

// Owners
const ownersApp = require('./api/owners');
const OwnersService = require('./services/OwnersService');
const OwnersValidator = require('./validator/owners');

// users
const users = require('./api/users');
const UsersService = require('./services/UsersService');
const UsersValidator = require('./validator/users');

// Koss
const kossApp = require('./api/koss');
const KossService = require('./services/KossService');
const KossValidator = require('./validator/koss');

// Room
const roomApp = require('./api/room');
const RoomService = require('./services/RoomService');
const RoomValidator = require('./validator/room');

// upload
const StorageService = require('./services/StorageService');

const init = async () => {
  const usersService = new UsersService();
  const ownersService = new OwnersService();
  const kossService = new KossService();
  const storageService = new StorageService(path.resolve(__dirname, 'api/koss/file'));
  const roomService = new RoomService();

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
      plugin: users,
      options: {
        service: usersService,
        validator: UsersValidator,
      },
    },
    {
      plugin: ownersApp,
      options: {
        service: ownersService,
        validator: OwnersValidator,
      },
    },
    {
      plugin: kossApp,
      options: {
        kossService,
        storageService,
        validator: KossValidator,
      },
    },
    {
      plugin: roomApp,
      options: {
        service: roomService,
        validator: RoomValidator,
      },
    },
  ]);

  server.ext('onPreResponse', (request, h) => {
    const { response } = request;
    if (response instanceof Error) {
      if (response instanceof ClientError) {
        const newResponse = h.response({
          status: 'fail',
          message: response.message,
        });
        newResponse.code(response.statusCode);
        return newResponse;
      }
      if (!response.isServer) {
        return h.continue;
      }
      const newResponse = h.response({
        status: 'error',
        message: 'terjadi kegagalan pada server kami',
      });
      newResponse.code(500);
      console.error(response);
      return newResponse;
    }
    return h.continue || h;
  });

  await server.start();
  console.log('TEST');
};

init();
