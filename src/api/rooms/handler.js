const autoBind = require('auto-bind');
const { assignImageToArray } = require('../../utils');
const InvariantError = require('../../exceptions/InvariantError');

class RoomsHandler {
  constructor(roomsService, kossService, storageService, validator) {
    this._roomsService = roomsService;
    this._kossService = kossService;
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

    const { id: credentialId } = request.auth.credentials;

    await this._kossService.verifyKosAccess(kosId, credentialId);
    await this._validator.validateRoomPayload(request.payload);

    if (arrayImgs.length > 0) {
      await Promise.all(arrayImgs.map(async (image) => {
        await this._validator.validateImageRoomPayload(image);
      }));
    }

    const roomId = await this._roomsService.addRoom({
      kosId,
      type,
      maxPeople,
      price,
      quantity,
      description,
    }, arrayImgs);

    if (arrayImgs.length > 0) {
      await Promise.all(arrayImgs.map(async (image) => {
        await this._storageService.writeFile(image, image.hapi, 'rooms');
      }));
    }

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
    const { kosId } = request.params;
    const { roomId, images } = request.payload;
    const { id: credentialId } = request.auth.credentials;
    const arrayImgs = assignImageToArray(images);

    await this._roomsService.verifyRoomAccess(roomId, credentialId);

    if (arrayImgs.length === 0) throw new InvariantError('Image tidak ada');

    Promise.all(arrayImgs.map(async (image) => {
      await this._validator.validateImageRoomPayload(image);
    }));

    const imgsId = await this._roomsService.addImageRoom(kosId, roomId, arrayImgs);
    if (arrayImgs.length > 0) {
      await Promise.all(arrayImgs.map(async (image) => {
        await this._storageService.writeFile(image, image.hapi, 'rooms');
      }));
    }

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
    const { rooms, isCache } = await this._roomsService.getRoomsByKosId(kosId);
    console.log(isCache);

    const response = h.response({
      status: 'success',
      data: {
        rooms,
      },
    });

    if (isCache) {
      response.header('X-Data-Source', 'cache');
    }

    response.code(200);
    return response;
  }

  async getRoomByIdHandler(request, h) {
    const { roomId } = request.params;
    const { room, isCache } = await this._roomsService.getRoomById(roomId);

    const response = h.response({
      status: 'success',
      data: {
        room,
      },
    });

    if (isCache) {
      response.header('X-Data-Source', 'cache');
    }

    response.code(200);
    return response;
  }

  async getPriceByRoomIdHandler(request, h) {
    const { duration } = request.query;
    let price = await this._roomsService.getPriceByRoomId;

    if (duration) {
      if (duration === 12) {
        price *= 2;
      }
    }

    const response = h.response({
      status: 'success',
      data: {
        price,
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
    const { id: credentialId } = request.auth.credentials;

    await this._roomsService.verifyRoomAccess(roomId, credentialId);
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
    const { roomId, imageId } = request.params;
    const { id: credentialId } = request.auth.credentials;
    // const { imageId } = request.payload;
    await this._roomsService.verifyRoomAccess(roomId, credentialId);
    await this._roomsService.delImageRoomById(roomId, imageId);
    // const filename = pathImageFile.match('/rooms/(.*)/')[1];
    // await this._storageService.deleteFile(filename, 'rooms');

    const response = h.response({
      status: 'success',
      message: 'Image Room berhasil dihapus',
    });

    response.code(200);
    return response;
  }
}

module.exports = RoomsHandler;
