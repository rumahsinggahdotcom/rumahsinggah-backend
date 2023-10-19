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
    path: '/owner/changepassword/{username}',
    handler: handler.putOwnerPasswordByUsernameHandler,
  },
];

module.exports = ownerRoutes;
