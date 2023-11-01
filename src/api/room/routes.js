const routes = (handler) => [
  {
    method: 'PUT',
    path: 'koss/room/addroom',
    handler: handler.postRoomHandler,
  },
  {
    method: 'GET',
    path: 'koss/{id}/room',
    handler: handler.getRoomByKosIdHandler,
  },
  {
    method: 'PUT',
    path: 'koss/room/{id}',
    handler: handler.putRoomByIdHandler,
  },
];

module.exports = routes;
