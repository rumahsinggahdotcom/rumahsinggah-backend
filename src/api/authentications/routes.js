const routes = (handler) => [
  {
    method: 'POST',
    path: '/authentications',
    handler: handler.postAuthHandler,
  },
  {
    method: 'PUT',
    path: '/authentications',
    handler: handler.putAuthHandler,
  },
  {
    method: 'DELETE',
    path: '/authentications',
    handler: handler.deleteAuthHandler,
  },
  // {
  //   method: 'POST',
  //   path: '/user/authentications',
  //   handler: handler.postUsersAuthHandler,
  // },
  // {
  //   method: 'PUT',
  //   path: '/user/authentications',
  //   handler: handler.putUsersAuthHandler,
  // },
  // {
  //   method: 'DELETE',
  //   path: '/user/authentications',
  //   handler: handler.deleteUsersAuthHandler,
  // },
];

module.exports = routes;
