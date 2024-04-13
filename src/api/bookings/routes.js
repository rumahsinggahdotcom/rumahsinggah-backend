const routes = (handler) => [
  {
    method: 'POST',
    path: '/koss/booking',
    handler: handler.postBookingHandler,
    options: {
      auth: 'kossapp_jwt',
    },
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
    handler: handler.acceptBookingByIdHandler,
    options: {
      auth: 'kossapp_jwt',
    },
  },
  {
    method: 'POST',
    path: '/booking/midtransnotification',
    handler: handler.midtransNotificationHandler,
  },
];

module.exports = routes;
