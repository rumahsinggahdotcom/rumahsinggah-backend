const ownerRoutes = (handler) => [
  {
    method: 'POST',
    path: '/owner',
    handler: handler.postOwnerHandler,
  },
  {
    method: 'GET',
    path: '/owner',
    handler: () => ({
      value: 'EA',
    }),
  },
];

exports.module = ownerRoutes;
