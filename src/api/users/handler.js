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
}

module.exports = UsersHandler;
