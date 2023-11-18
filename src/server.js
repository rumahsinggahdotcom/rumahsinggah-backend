require('dotenv').config();
const hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
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
const roomApp = require('./api/rooms');
const RoomsService = require('./services/RoomsService');
const RoomsValidator = require('./validator/room');

// upload
const StorageService = require('./services/StorageService');

// Authentications
const authApp = require('./api/authentications');
const AuthenticationService = require('./services/AuthenticationsService');
const AuthenticationsValidator = require('./validator/authentications');
const TokenManager = require('./tokenize/TokenManager');

const init = async () => {
  const usersService = new UsersService();
  const ownersService = new OwnersService();
  const kossService = new KossService();
  const storageService = new StorageService(path.resolve(__dirname, 'api/file'));
  const roomsService = new RoomsService();
  const authService = new AuthenticationService();

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
      plugin: Jwt,
    },
  ]);

  server.auth.strategy('kossapp_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
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
        roomsService,
        storageService,
        validator: RoomsValidator,
      },
    },
    {
      plugin: authApp,
      options: {
        authService,
        usersService,
        ownersService,
        tokenManager: TokenManager,
        validator: AuthenticationsValidator,
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
