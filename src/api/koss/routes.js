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
      auth: 'kossapp_jwt',
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
      auth: 'kossapp_jwt',
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
      auth: 'kossapp_jwt',
    },
  },
  {
    method: 'DELETE',
    path: '/koss/{id}/images',
    handler: handler.delImageKosByIdHandler,
    options: {
      auth: 'kossapp_jwt',
    },
  },

  // Owners Koss
  {
    method: 'GET',
    path: '/owner/koss',
    handler: handler.getOwnerKossHandler,
    options: {
      auth: 'kossapp_jwt',
    },
  },
];

module.exports = kossRoutes;
