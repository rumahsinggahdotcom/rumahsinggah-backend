const routes = (handler) => [
  {
    method: 'POST',
    path: '/user',
    handler: handler.postUserHandler,
  },
  {
    method: 'GET',
    path: '/user/{kosId}',
    handler: handler.getUsersByKosIdHandler,
  },
  {
    method: 'GET',
    path: '/user',
    handler: handler.getUserById,
    options: {
      auth: 'kossapp_jwt',
    },
  },
];

module.exports = routes;
