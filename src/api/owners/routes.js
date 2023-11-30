const ownerRoutes = (handler) => [
  {
    method: 'POST',
    path: '/owner',
    handler: handler.postOwnerHandler,
  },
  {
    method: 'GET',
    path: '/owner',
    handler: handler.getOwnerByIdHandler,
    options: {
      auth: 'kossapp_jwt',
    },
  },
  {
    method: 'PUT',
    path: '/owner',
    handler: handler.putOwnerByIdHandler,
    options: {
      auth: 'kossapp_jwt',
    },
  },
  {
    method: 'PUT',
    path: '/owner/changepassword',
    handler: handler.putOwnerPasswordByIdHandler,
    options: {
      auth: 'kossapp_jwt',
    },
  },
];

module.exports = ownerRoutes;
