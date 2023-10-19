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
];

module.exports = ownerRoutes;
