const routes = (handler) => [
  {
    method: 'POST',
    path: '/users',
    handler: handler.postUserHandler,
  },
  {
    method: 'GET',
    path: '/users/{kosId}',
    handler: handler.getUsersByKosIdHandler,
  },
];

module.exports = routes;
