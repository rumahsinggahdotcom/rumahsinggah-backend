const routes = (handler) => [
  {
    method: 'POST',
    path: '/booking',
    handler: handler.postUsersBookingHandler,
  },
];

module.exports = routes;
