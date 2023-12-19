const routes = (handler) => [
  {
    method: 'POST',
    path: '/koss/{kosId}/reviews',
    handler: handler.postReviewsHandler,
  },
];

module.exports = routes;
