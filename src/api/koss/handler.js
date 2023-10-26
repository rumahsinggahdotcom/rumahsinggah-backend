const autobind = require('auto-bind');

class KossHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
    autobind(this);
  }

  async postKosHandler(request, h) {
    const { image } = request.payload;
    const ownerId = request.params;
    const {
      name,
      address,
    } = request.payload;

    await this._validator.validateKosPayload({ ownerId, name, address });

    if (image) {
      await this._validator.validateImageKosPayload(image.hapi.headers);
      await this._imageKosService.addImageKos({ image });
    }

    const kosId = await this._kosService.addKos({ ownerId, name, address });

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
}

module.exports = KossHandler;
