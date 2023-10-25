const ownerRoutes = (handler) => [
  {
    method: 'POST',
    path: '/owner',
    handler: handler.postOwnerHandler,
  },
  {
    method: 'PUT',
    path: '/owner/{id}',
    handler: handler.putOwnerByIdHandler,
  },
  {
    method: 'PUT',
    path: '/owner/{id}/changepassword',
    handler: handler.putOwnerPasswordByIdHandler,
  },
];

module.exports = ownerRoutes;
