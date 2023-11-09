const routes = (handler) => [
  {
    method: 'POST',
    path: '/koss/room',
    handler: handler.postRoomHandler,
    options: {
      payload: {
        allow: 'multipart/form-data',
        multipart: true,
        output: 'stream',
        maxBytes: 1024000,
      },
    },
  },
  {
    method: 'GET',
    path: '/koss/{kosId}/rooms',
    handler: handler.getRoomsByKosIdHandler,
  },
  {
    method: 'GET',
    path: '/koss/{kosId}/rooms/{roomId}',
    handler: handler.getRoomByIdHandler,
  },
  {
    method: 'PUT',
    path: '/koss/{kosId}/room/{id}',
    handler: handler.putRoomByIdHandler,
    options: {
      payload: {
        allow: 'multipart/form-data',
        multipart: true,
        output: 'stream',
        maxBytes: 1024000,
      },
    },
  },
];

module.exports = routes;
