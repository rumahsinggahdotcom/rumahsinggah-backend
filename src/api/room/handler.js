const autoBind = require('auto-bind');

class RoomHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
    this(autoBind);
  }

  async postRoomHandler(request, h) {
    await this._validator.validateRoomPayload(request.payload);
    const roomId = await this._service.addRoom(request.payload);

    const response = h.response({
      status: 'success',
      message: 'Room Berhasil Ditambahkan',
      data: {
        roomId,
      },
    });

    response.code(201);
    return response;
  }

  async getRoomByKosIdHandler(request, h) {
    const rooms = await this._service.getRoomByKosId();

    const response = h.response({
      status: 'success',
      data: {
        rooms,
      },
    });

    response.code(200);

    return response;
  }
}

module.exports = RoomHandler;
