const hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const Inert = require('@hapi/inert');
const path = require('path');
// const Mongoose = require('mongoose');
// const { MongoClient } = require('mongodb');
// const mongodb = require('hapi-mongodb');
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

// Booking
const bookingApp = require('./api/bookings');
const BookingService = require('./services/BookingsService');
const BookingValidator = require('./validator/bookings');

// upload
const StorageService = require('./services/StorageService');

// Authentications
const authApp = require('./api/authentications');
const AuthenticationService = require('./services/AuthenticationsService');
const AuthenticationsValidator = require('./validator/authentications');
const TokenManager = require('./tokenize/TokenManager');

// Reviews
const reviewApp = require('./api/reviews');
const ReviewsService = require('./services/ReviewsService');
const ReviewsValidator = require('./validator/reviews');

// Cache
const CacheService = require('./services/CacheService');

require('dotenv').config();

// let db;

// const connectToMongo = async () => {
//   const client = new MongoClient('mongodb+srv://brillianitaaa:SJUN4FDLPfETnczI@cluster0.693knwt.mongodb.net/');
//   await client.connect();
//   console.log('Connected to MongoDB');
//   db = client.db('rumahsinggahdotcom');
// };

// const getDb = () => {
//   if (!db) {
//     throw Error('Database not initialized');
//   }
//   return db;
// };

const init = async () => {
  const cacheService = new CacheService();
  const usersService = new UsersService();
  const ownersService = new OwnersService();
  const storageService = new StorageService(path.resolve(__dirname, 'api/file'));
  const kossService = new KossService(cacheService, storageService);
  const roomsService = new RoomsService(cacheService, storageService);
  const authService = new AuthenticationService();
  const bookingService = new BookingService();
  const reviewsService = new ReviewsService();
  // const mongoose = new Mongoose();

  const server = hapi.server({
    port: process.env.PORT,
    host: process.env.NODE_ENV !== 'production' ? 'localhost' : '0.0.0.0',
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  // await connectToMongo();

  // await Mongoose
  //   .connect(`mongodb://${process.env.MONGOUSER}:${process.env.MONGOPASSWORD}/${process.env.MONGODATABASE}`)
  //   // .connect('mongodb://localhost:27017/rumahsinggahdotcom')
  //   .then(() => {
  //     console.log('db started!');
  //   })
  //   .catch((e) => {
  //     console.log(e);
  //   });

  // registrasi plugin eksternal
  await server.register([
    {
      plugin: Jwt,
    },
    {
      plugin: Inert,
    },
  ]);

  // configure hapi-mongodb connection
  // await server.register({
  //   plugin: mongodb,
  //   options: {
  //     url: 'mongodb+srv://brillianitaaa:SJUN4FDLPfETnczI@cluster0.693knwt.mongodb.net/',
  //   },
  //   settings: {
  //     useUnifiedTopology: true,
  //     useNewUrlParser: true,
  //   },
  //   decorate: true,
  // });

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
        ownersService,
        validator: KossValidator,
      },
    },
    {
      plugin: roomApp,
      options: {
        kossService,
        roomsService,
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
    {
      plugin: bookingApp,
      options: {
        service: bookingService,
        validator: BookingValidator,
      },
    },
    {
      plugin: reviewApp,
      options: {
        service: reviewsService,
        validator: ReviewsValidator,
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
