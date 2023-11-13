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
    method: 'POST',
    path: '/koss/room/images',
    handler: handler.postRoomImagesHandler,
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
    path: '/koss/{kosId}/room/{roomId}',
    handler: handler.putRoomByIdHandler,
  },
  {
    method: 'DELETE',
    path: '/koss/room/images/{id}',
    handler: handler.delImageRoomByIdHandler,
  },
];

module.exports = routes;
