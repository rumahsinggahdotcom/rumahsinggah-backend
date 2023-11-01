const kossRoutes = (handler) => [
  {
    method: 'POST',
    path: '/addkos',
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
  },
];

module.exports = kossRoutes;
