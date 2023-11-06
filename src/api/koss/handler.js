const autobind = require('auto-bind');

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
    } = request.payload;

    let arrayImgs = [];
    const { images } = request.payload;
    if (images.length > 1) {
      arrayImgs = images;
    } else {
      arrayImgs.push(images);
    }

    // Validate Kos Payload
    await this._validator.validateKosPayload({ ownerId, name, address });

    // Validate Image Kos Payload
    if (arrayImgs) {
      await Promise.all(arrayImgs.map(async (image) => {
        await this._validator.validateImageKosPayload(image.hapi.headers);
      }));
    }

    const kosId = await this._kossService.addKos({ ownerId, name, address }, arrayImgs);

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
    const { name, address } = request.payload;

    const { images } = request.payload;
    let arrayImgs = [];
    if (images.length > 1) {
      arrayImgs = images;
    } else {
      arrayImgs.push(images);
    }

    // Validate Kos Payload
    await this._validator.validateKosPayload({ name, address });

    // Validate Image Kos Payload
    if (arrayImgs) {
      await Promise.all(arrayImgs.map(async (image) => {
        await this._validator.validateImageKosPayload(image.hapi.headers);
      }));
    }

    await this._kossService.editKosById(id, { name, address }, arrayImgs);

    const response = h.response({
      status: 'success',
      message: 'Kos Berhasil Diedit',
    });

    response.code(200);
    return response;
  }
}

module.exports = KossHandler;
