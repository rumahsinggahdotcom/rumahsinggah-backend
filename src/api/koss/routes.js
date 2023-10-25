const kossRoutes = (handler) => [
  {
    method: 'POST',
    path: '/owner/addkos',
    handler: handler.postKossHandler,
  },
];

module.exports = kossRoutes;
