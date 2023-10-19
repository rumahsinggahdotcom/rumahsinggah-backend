const autoBind = require('auto-bind');

class OwnersHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
    autoBind(this);
  }

  async postOwnerHandler(request, h) {
    this._validator.validateOwnerPayload(request.payload);

    const ownerId = await this._service.addOwner(request.payload);

    const response = h.response({
      status: 'success',
      message: 'Owner berhasil ditambahkan',
      data: {
        ownerId,
      },
    });

    response.code(201);
    return response;
  }
}

module.exports = OwnersHandler;
