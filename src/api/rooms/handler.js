const autoBind = require('auto-bind');
const { assignImageToArray } = require('../../utils');

class RoomsHandler {
  constructor(roomsService, storageService, validator) {
    this._roomsService = roomsService;
    this._storageService = storageService;
    this._validator = validator;
    autoBind(this);
  }

  async postRoomHandler(request, h) {
    // const { kosId } = request.params;
    const { images } = request.payload;
    const arrayImgs = assignImageToArray(images);
    const {
      kosId,
      type,
      maxPeople,
      price,
      quantity,
      description,
    } = request.payload;

    await this._validator.validateRoomPayload(request.payload);
    await Promise.all(arrayImgs.map(async (image) => {
      this._validator.validateImageRoomPayload(image);
    }));

    const roomId = await this._roomsService.addRoom({
      kosId,
      type,
      maxPeople,
      price,
      quantity,
      description,
    }, arrayImgs);

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

  async postRoomImagesHandler(request, h) {
    const { roomId, images } = request.payload;
    const arrayImgs = assignImageToArray(images);

    Promise.all(arrayImgs.map(async (image) => {
      await this._validator.validateImageRoomPayload(image);
    }));

    const imgsId = await this._roomsService.addImageRoom(roomId, arrayImgs);

    const response = h.response({
      status: 'success',
      message: 'Image Room berhasil ditambahkan',
      data: {
        imgsId,
      },
    });

    response.code(201);
    return response;
  }

  async getRoomsByKosIdHandler(request, h) {
    const { kosId } = request.params;
    const rooms = await this._roomsService.getRoomsByKosId(kosId);

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
    // console.log(request.params);
    // console.log(request.params);
    const { roomId } = request.params;
    const room = await this._roomsService.getRoomById(roomId);

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
    const { roomId } = request.params;
    const {
      type,
      maxPeople,
      price,
      quantity,
      description,
    } = request.payload;

    await this._roomsService.editRoomById(roomId, {
      type,
      maxPeople,
      price,
      quantity,
      description,
    });

    const response = h.response({
      status: 'success',
      message: 'Rooms berhasil diedit',
    });

    response.code(200);

    return response;
  }

  async delImageRoomByIdHandler(request, h) {
    const { id } = request.params;
    const filename = await this._roomsService.delImageRoomById(id);
    await this._storageService.deleteFile(filename, 'rooms');

    const response = h.response({
      status: 'success',
      message: 'Image Room berhasil dihapus',
    });

    response.code(200);
    return response;
  }
}

module.exports = RoomsHandler;
