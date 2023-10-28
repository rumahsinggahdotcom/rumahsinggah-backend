const kossRoutes = (handler) => [
  {
    method: 'POST',
    path: '/owner/addkos',
    handler: handler.postKosHandler,
    options: {
      payload: {
        allow: 'multipart/form-data',
        multipart: true,
        output: 'stream',
        maxBytes: 512000, // 500KB
      },
    },
  },
];

module.exports = kossRoutes;
