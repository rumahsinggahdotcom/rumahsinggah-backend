const autobind = require('auto-bind');
const { assignImageToArray } = require('../../utils');

class KossHandler {
  constructor(kossService, ownersService, validator) {
    this._kossService = kossService;
    this._ownersService = ownersService;
    this._validator = validator;
    autobind(this);
  }

  async postKosHandler(request, h) {
    const {
      name,
      address,
      description,
    } = request.payload;

    const { images } = request.payload;
    const { id: credentialId } = request.auth.credentials;
    const arrayImgs = assignImageToArray(images);

    await this._ownersService.verifyOwnersOnly(credentialId);

    // Validate Kos Payload
    await this._validator.validateKosPayload({
      name,
      address,
      description,
    });

    // Validate Image Kos Payload
    if (arrayImgs.length > 0) {
      await Promise.all(arrayImgs.map(async (image) => {
        await this._validator.validateImageKosPayload(image.hapi.headers);
      }));
    }

    const kosId = await this._kossService.addKos({
      ownerId: credentialId,
      name,
      address,
      description,
    }, arrayImgs);

    const response = h.response({
      status: 'success',
      message: 'Kos Berhasil Ditambahkan',
      data: {
        kosId,
      },
    });

    response.code(201);
    return response;
  }

  async postKosImagesHandler(request, h) {
    const { kosId, images } = request.payload;
    const arrayImgs = assignImageToArray(images);
    const { id: credentialId } = request.auth.credentials;

    await this._kossService.verifyKosAccess(kosId, credentialId);

    if (arrayImgs.length > 0) {
      await Promise.all(arrayImgs.map(async (image) => {
        await this._validator.validateImageKosPayload(image);
      }));
    }
    const imgsId = await this._kossService.addImageKos(kosId, arrayImgs, credentialId);

    const response = h.response({
      status: 'success',
      message: 'Image Kos berhasil ditambahkan',
      data: {
        imgsId,
      },
    });

    response.code(201);
    return response;
  }

  async getKossHandler(request, h) {
    const { koss, isCache } = await this._kossService.getKoss();

    const response = h.response({
      status: 'success',
      data: koss,
    });

    if (isCache) {
      response.header('X-Data-Source', 'cache');
    }
    response.code(200);
    return response;
  }

  async getKosByIdHandler(request, h) {
    const { id } = request.params;
    const { kos, isCache } = await this._kossService.getKosById(id);

    const response = h.response({
      status: 'success',
      data: {
        kos,
      },
    });

    if (isCache) {
      response.header('X-Data-Source', 'cache');
    }

    response.code(200);
    return response;
  }

  async getOwnerKossHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;
    const { ownerKoss, isCache } = await this._kossService.getOwnerKoss({ owner: credentialId });

    const response = h.response({
      status: 'success',
      data: {
        ownerKoss,
      },
    });

    if (isCache) {
      response.header('X-Data-Source', 'cache');
    }

    response.code(200);
    return response;
  }

  async putKosByIdHandler(request, h) {
    const { id } = request.params;
    const { name, address, description } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    await this._kossService.verifyKosAccess(id, credentialId);

    // Validate Kos Payload
    await this._validator.validateKosPayload({ name, address, description });
    await this._kossService.editKosById(id, { name, address, description });

    const response = h.response({
      status: 'success',
      message: 'Kos Berhasil Diedit',
    });

    response.code(200);
    return response;
  }

  async delImageKosByIdHandler(request, h) {
    const { kosId, imageId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._kossService.verifyKosAccess(kosId, credentialId);
    await this._kossService.delImageKosById(kosId, imageId);

    const response = h.response({
      status: 'success',
      message: 'Image berhasil dihapus.',
    });

    response.code(200);
    return response;
  }
}

module.exports = KossHandler;
