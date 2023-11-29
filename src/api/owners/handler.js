const autoBind = require('auto-bind');

class OwnersHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
    autoBind(this);
  }

  async postOwnerHandler(request, h) {
    await this._validator.validateOwnerPayload(request.payload);

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

  async putOwnerByIdHandler(request, h) {
    const {
      fullname,
      address,
      gender,
      phoneNumber,
    } = request.payload;

    const { id: credentialId } = request.auth.params;

    await this._validator.validateEditOwnerPayload({
      fullname,
      address,
      gender,
      phoneNumber,
    });

    await this._service.editOwnerById(credentialId, {
      fullname,
      address,
      gender,
      phoneNumber,
    });

    const response = h.response({
      status: 'success',
      message: 'Owner berhasil diedit',
    });

    response.code(201);
    return response;
  }

  async putOwnerPasswordByIdHandler(request, h) {
    const {
      oldPassword,
      newPassword,
    } = request.payload;

    await this._validator.validateOwnerPasswordPayload({
      oldPassword,
      newPassword,
    });
    // const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._service.editPasswordById(credentialId, {
      oldPassword,
      newPassword,
    });

    const response = h.response({
      status: 'success',
      message: 'Password berhasil diedit',
    });

    response.code(201);
    return response;
  }

  async getOwnerByIdHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;
    const owner = await this._service.getOwnerById(credentialId);

    const response = h.response({
      status: 'success',
      data: {
        owner,
      },
    });

    response.code(200);
    return response;
  }
}

module.exports = OwnersHandler;
