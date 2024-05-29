const routes = (handler) => [
  {
    method: 'POST',
    path: '/booking',
    handler: handler.postBookingHandler,
    options: {
      auth: 'kossapp_jwt',
    },
  },
  {
    method: 'GET',
    path: '/booking',
    handler: handler.getBookingsByRoleHandler,
    options: {
      auth: 'kossapp_jwt',
    },
  },
  {
    method: 'GET',
    path: '/booking/{id}',
    handler: handler.getBookingByIdHandler,
    options: {
      auth: 'kossapp_jwt',
    },
  },
  {
    method: 'PUT',
    path: '/booking/{id}',
    handler: handler.confirmProcessBookingByIdHandler,
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
