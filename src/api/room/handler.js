const autoBind = require('auto-bind');

class RoomHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
    autoBind(this);
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

  async getRoomsByKosIdHandler(request, h) {
    const { kosId } = request.params;
    const rooms = await this._service.getRoomsByKosId(kosId);

    const response = h.response({
      status: 'success',
      data: {
        rooms,
      },
    });

    response.code(200);
    return response;
  }

  async getRoomByIdHandler(request, h) {
    console.log(request.params);
    const room = await this._service.getRoomById();

    const response = h.response({
      status: 'success',
      data: {
        room,
      },
    });

    response.code(200);
    return response;
  }

  async putRoomByIdHandler(request, h) {
    const { id } = request.params;
    const roomId = await this._service.editRoomById(id, request.payload);

    const response = h.response({
      status: 'success',
      data: {
        roomId,
      },
    });

    response.code(200);

    return response;
  }
}

module.exports = RoomHandler;
