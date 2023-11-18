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
];

module.exports = routes;
