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

    await this._service.addUser({
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
    });
    response.code(201);
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
}

module.exports = UsersHandler;
