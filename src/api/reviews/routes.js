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
  {
    method: 'PUT',
    path: '/koss/{kosId}/reviews/{reviewId}',
    handler: handler.putReviewByIdHandler,
  },
];

module.exports = routes;
