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
    options: {
      auth: 'kossapp_jwt',
    },
  },
  {
    method: 'PUT',
    path: '/koss/booking/{id}',
    handler: handler.putBookingByIdHandler,
    options: {
      auth: 'kossapp_jwt',
    },
  },
  {
    method: 'POST',
    path: '/koss/booking/payment',
    handler: handler.postMidtransTransactionHandler,
    options: {
      auth: 'kossapp_jwt',
    },
  },
];

module.exports = routes;
