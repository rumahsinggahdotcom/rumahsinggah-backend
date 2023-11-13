const autobind = require('auto-bind');
const { assignImageToArray } = require('../../utils');

class KossHandler {
  constructor(kossService, storageService, validator) {
    this._kossService = kossService;
    this._storageService = storageService;
    this._validator = validator;
    autobind(this);
  }

  async postKosHandler(request, h) {
    const {
      ownerId,
      name,
      address,
      description,
    } = request.payload;

    const { images } = request.payload;
    const arrayImgs = assignImageToArray(images);

    // Validate Kos Payload
    await this._validator.validateKosPayload({
      ownerId,
      name,
      address,
      description,
    });

    // Validate Image Kos Payload
    if (arrayImgs) {
      await Promise.all(arrayImgs.map(async (image) => {
        await this._validator.validateImageKosPayload(image.hapi.headers);
      }));
    }

    const kosId = await this._kossService.addKos({
      ownerId,
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

    await Promise.all(arrayImgs.map(async (image) => {
      await this._validator.validateImageKosPayload(image);
    }));

    const imgsId = await this._kossService.addImageKos(kosId, arrayImgs);

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
    const koss = await this._kossService.getKoss();

    const response = h.response({
      status: 'success',
      data: {
        koss,
      },
    });

    response.code(200);
    return response;
  }

  async getKosByIdHandler(request, h) {
    const { id } = request.params;
    const kos = await this._kossService.getKosById(id);

    const response = h.response({
      status: 'success',
      data: {
        kos,
      },
    });

    response.code(200);
    return response;
  }

  async putKosByIdHandler(request, h) {
    const { id } = request.params;
    const { name, address, description } = request.payload;

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
    const { id } = request.params;

    const filename = await this._kossService.delImageKosById(id);

    await this._storageService.deleteFile(filename, 'koss');

    const response = h.response({
      status: 'success',
      message: 'Image berhasil dihapus.',
    });

    response.code(200);
    return response;
  }
}

module.exports = KossHandler;
