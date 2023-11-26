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
      auth: 'kossapp_jwt',
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
    options: {
      auth: 'kossapp_jwt',
    },
  },
  {
    method: 'DELETE',
    path: '/koss/room/{id}/images',
    handler: handler.delImageRoomByIdHandler,
    options: {
      auth: 'kossapp_jwt',
    },
  },
];

module.exports = routes;
