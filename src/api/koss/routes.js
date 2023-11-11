const kossRoutes = (handler) => [
  {
    method: 'POST',
    path: '/koss',
    handler: handler.postKosHandler,
    options: {
      payload: {
        allow: 'multipart/form-data',
        multipart: true,
        output: 'stream',
        maxBytes: 512000, // 500KB
      },
    },
  },
  {
    method: 'POST',
    path: '/koss/images',
    handler: handler.postKosImagesHandler,
    options: {
      payload: {
        allow: 'multipart/form-data',
        multipart: true,
        output: 'stream',
        maxBytes: 512000,
      },
    },
  },
  {
    method: 'GET',
    path: '/koss',
    handler: handler.getKossHandler,
  },
  {
    method: 'GET',
    path: '/koss/{id}',
    handler: handler.getKosByIdHandler,
  },
  {
    method: 'PUT',
    path: '/koss/{id}',
    handler: handler.putKosByIdHandler,
    options: {
      payload: {
        allow: 'multipart/form-data',
        multipart: true,
        output: 'stream',
        maxBytes: 1024000, // 500KB
      },
    },
  },
];

module.exports = kossRoutes;
