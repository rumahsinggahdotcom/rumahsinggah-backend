const autobind = require('auto-bind');

class KossHandler {
  constructor(kossService, storageService, validator) {
    this._kossService = kossService;
    this._storageService = storageService;
    this._validator = validator;
    autobind(this);
  }

  async postKosHandler(request, h) {
    console.log(request.payload);
    const { images } = request.payload;
    const {
      ownerId,
      name,
      address,
    } = request.payload;

    await this._validator.validateKosPayload({ ownerId, name, address });
    const kosId = await this._kossService.addKos({ ownerId, name, address });
    if (images.length > 1) {
      await Promise.all(images.map(async (image) => {
        await this.addImage(kosId, image);
      }));
    } else {
      await this.addImage(kosId, images);
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

  async addImage(kosId, image) {
    await this._validator.validateImageKosPayload(image.hapi.headers);
    const filename = await this._storageService.writeFile(image, image.hapi);
    const url = `http://${process.env.HOST}:${process.env.PORT}/file/image/${filename}`;
    await this._kossService.addImageKos(kosId, url);
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
    const { name, address } = request.payload;
    const { id } = request.params;
    await this._validator.validateKosPayload({ name, address });
    await this._kossService.editKosById(id, { name, address });
    // if (images)

    const response = h.response({
      status: 'success',
      message: 'Kos Berhasil Diedit',
    });

    response.code(200);
    return response;
  }
}

module.exports = KossHandler;
