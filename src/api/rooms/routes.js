const path = require('path');

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
      auth: 'kossapp_jwt',
    },
  },
  {
    method: 'POST',
    path: '/koss/{kosId}/room/images',
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
    path: '/koss/{kosId}/room',
    handler: handler.getRoomsByKosIdHandler,
  },
  {
    method: 'GET',
    path: '/koss/{kosId}/room/{roomId}',
    handler: handler.getRoomByIdHandler,
  },
  {
    method: 'GET',
    path: '/file/rooms/{param*}',
    handler: {
      directory: {
        path: path.resolve(__dirname, '..', 'file/rooms'),
      },
    },
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
    path: '/room/{roomId}/image/{imageId}',
    handler: handler.delImageRoomByIdHandler,
    options: {
      auth: 'kossapp_jwt',
    },
  },
];

module.exports = routes;
