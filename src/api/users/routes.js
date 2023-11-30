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
    handler: handler.getUserByIdHandler,
    options: {
      auth: 'kossapp_jwt',
    },
  },
  {
    method: 'PUT',
    path: '/user',
    handler: handler.putUserByIdHandler,
    options: {
      auth: 'kossapp_jwt',
    },
  },
  {
    method: 'PUT',
    path: '/user/changepassword',
    handler: handler.putUserPasswordByIdHandler,
    options: {
      auth: 'kossapp_jwt',
    },
  },
];

module.exports = routes;
