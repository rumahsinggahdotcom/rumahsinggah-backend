const routes = (handler) => [
  {
    method: 'POST',
    path: '/owner/authentications',
    handler: handler.postOwnersAuthHandler,
  },
  {
    method: 'PUT',
    path: '/owner/authentications',
    handler: handler.putOwnersAuthHandler,
  },
  {
    method: 'DELETE',
    path: '/owner/authentications',
    handler: handler.deleteOwnersAuthHandler,
  },
  {
    method: 'POST',
    path: '/user/authentications',
    handler: handler.postUsersAuthHandler,
  },
  {
    method: 'PUT',
    path: '/user/authentications',
    handler: handler.putUsersAuthHandler,
  },
  {
    method: 'DELETE',
    path: '/user/authentications',
    handler: handler.deleteUsersAuthHandler,
  },
];

module.exports = routes;
