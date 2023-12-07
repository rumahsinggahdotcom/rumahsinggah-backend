const routes = (handler) => [
  {
    method: 'POST',
    path: '/koss/booking',
    handler: handler.postBookingHandler,
  },
  {
    method: 'GET',
    path: '/koss/booking',
    handler: handler.getBookingsByOwnerIdHandler,
    options: {
      auth: 'kossapp_jwt',
    },
  },
  {
    method: 'GET',
    path: '/koss/booking/{id}',
    handler: handler.getBookingByIdHandler,
  },
  {
    method: 'PUT',
    path: '/koss/booking/{id}',
    handler: handler.putBookingByIdHandler,
    options: {
      auth: 'kossapp_jwt',
    },
  },
];

module.exports = routes;
