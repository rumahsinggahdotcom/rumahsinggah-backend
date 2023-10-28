const autobind = require('auto-bind');

class KossHandler {
  constructor(kossService, imageKossService, storageService, validator) {
    this._kossService = kossService;
    this._imageKossService = imageKossService;
    this._storageService = storageService;
    this._validator = validator;
    autobind(this);
  }

  async postKosHandler(request, h) {
    const { images } = request.payload;
    const {
      ownerId,
      name,
      address,
    } = request.payload;

    await this._validator.validateKosPayload({ ownerId, name, address });
    const kosId = await this._kossService.addKos({ ownerId, name, address });

    if (images) {
      await Promise.all(images.map(async (image) => {
        await this._validator.validateImageKosPayload(image.hapi.headers);
        const filename = await this._storageService.writeFile(image, image.hapi);
        const url = `http://${process.env.HOST}:${process.env.PORT}/file/image/${filename}`;
        await this._imageKossService.addImageKos(url, kosId);
      }));
    }

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
}

module.exports = KossHandler;
