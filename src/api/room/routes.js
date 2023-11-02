const routes = (handler) => [
  {
    method: 'POST',
    path: '/koss/room',
    handler: handler.postRoomHandler,
  },
  {
    method: 'GET',
    path: '/koss/{id}/rooms',
    handler: handler.getRoomsByKosIdHandler,
  },
  {
    method: 'GET',
    path: '/koss/{kosId}/rooms/{roomId}',
    handler: handler.getRoomByIdHandler,
  },
  {
    method: 'PUT',
    path: '/koss/room/{id}',
    handler: handler.putRoomByIdHandler,
  },
];

module.exports = routes;
