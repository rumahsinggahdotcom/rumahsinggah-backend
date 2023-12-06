const routes = (handler) => [
  {
    method: 'POST',
    path: '/koss/booking',
    handler: handler.postUsersBookingHandler,
  },
  {
    method: 'GET',
    path: '/koss/booking',
    handler: handler.getBookingsByOwnerIdHandler,
    options: {
      auth: 'kossapp_jwt',
    },
  },
];

module.exports = routes;
