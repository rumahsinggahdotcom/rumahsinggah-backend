const autoBind = require('auto-bind');

class UsersHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBind(this);
  }

  async postUserHandler(request, h) {
    this._validator.validateUserPayload(request.payload);
    const {
      fullname,
      username,
      password,
      phoneNumber,
      address,
      gender,
    } = request.payload;

    const id = await this._service.addUser({
      fullname,
      username,
      password,
      phoneNumber,
      address,
      gender,
    });

    const response = h.response({
      status: 'success',
      message: 'User added successfully',
      data: {
        id,
      },
    });
    response.code(201);
    return response;
  }

  async putUserByIdHandler(request, h) {
    const {
      fullname,
      phoneNumber,
      address,
      gender,
    } = request.payload;

    const { id: credentialId } = request.auth.credentials;

    await this._validator.validateEditUserPayload({
      fullname,
      phoneNumber,
      address,
      gender,
    });

    await this._service.editUserById(credentialId, {
      fullname,
      phoneNumber,
      address,
      gender,
    });

    const response = h.response({
      status: 'success',
      message: 'User berhasil diedit',
    });

    response.code(200);
    return response;
  }

  async putUserPasswordByIdHandler(request, h) {
    const {
      oldPassword,
      newPassword,
    } = request.payload;

    const { id: credentialId } = request.auth.credentials;

    // await this.validator.

    await this._service.editPasswordById(credentialId, {
      oldPassword,
      newPassword,
    });

    const response = h.response({
      status: 'success',
      message: 'Password berhasil diganti',
    });

    response.code(200);
    return response;
  }

  async getUsersByKosIdHandler(request, h) {
    const { kosId } = request.params;
    const users = await this._service.getUsersByKosId(kosId);

    const response = h.response({
      status: 'success',
      data: {
        users,
      },
    });

    response.code(200);
    return response;
  }

  async getUserByIdHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;
    const user = await this._service.getUserById(credentialId);

    const response = h.response({
      status: 'success',
      data: {
        user,
      },
    });

    response.code(200);
    return response;
  }
}

module.exports = UsersHandler;
