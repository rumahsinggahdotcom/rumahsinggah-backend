const autobind = require('auto-bind');

class KossHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
    autobind(this);
  }

  async postKosHandler(request, h) {
    await this._validator.validateKossPayload(request.payload);

    const kosId = await this._service.addKos(request.payload);

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
