const routes = (handler) => [
  {
    method: 'POST',
    path: '/koss/{kosId}/reviews',
    handler: handler.postReviewsHandler,
  },
  {
    method: 'GET',
    path: '/koss/{kosId}/reviews/{reviewId}',
    handler: handler.getReviewByIdHandler,
  },
];

module.exports = routes;
