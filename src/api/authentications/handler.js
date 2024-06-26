const autoBind = require('auto-bind');

class AuthenticationHandlers {
  constructor(authsService, usersService, ownersService, tokenManager, validator) {
    this._authsService = authsService;
    this._usersService = usersService;
    this._ownersService = ownersService;
    this._tokenManager = tokenManager;
    this._validator = validator;

    autoBind(this);
  }

  async postOwnersAuthHandler(request, h) {
    const { username, password } = request.payload;

    await this._validator.validatePostAuthPayload({ username, password });
    const {
      id,
      fullname,
      role,
    } = await this._ownersService.verifyOwnersCredentials({
      username,
      password,
    });

    const accessToken = await this._tokenManager.generateAccessToken({ id });
    const refreshToken = await this._tokenManager.generateRefreshToken({ id });

    await this._authsService.addRefreshToken(refreshToken);

    const response = h.response({
      status: 'success',
      data: {
        user: {
          id,
          fullname,
          role,
        },
        accessToken,
        refreshToken,
      },
    });

    response.code(201);

    return response;
  }

  async putOwnersAuthHandler(request, h) {
    const { refreshToken } = request.payload;
    await this._validator.validatePutAuthPayload(refreshToken);

    await this._authsService.verifyRefreshToken(refreshToken);
    const { id } = await this._tokenManager.verifyRefreshToken(refreshToken);

    const accessToken = await this._tokenManager.generateAccessToken({ id });

    const response = h.response({
      status: 'success',
      data: {
        accessToken,
      },
    });

    response.code(200);

    return response;
  }

  async deleteOwnersAuthHandler(request, h) {
    const { refreshToken } = request.payload;
    console.log('request.payload', request.payload);
    console.log('refreshToken', refreshToken);
    await this._validator.validateDeleteAuthPayload(refreshToken);

    await this._authsService.verifyRefreshToken(refreshToken);
    await this._authsService.deleteRefreshToken(refreshToken);

    const response = h.response({
      status: 'success',
      message: 'Refresh token behasil dihapus',
    });

    response.code(200);

    return response;
  }

  async postUsersAuthHandler(request, h) {
    const { username, password } = request.payload;

    await this._validator.validatePostAuthPayload({ username, password });

    const id = await this._usersService.verifyUsersCredentials({ username, password });

    const refreshToken = await this._tokenManager.generateRefreshToken({ id });
    const accessToken = await this._tokenManager.generateAccessToken({ id });

    await this._authsService.addRefreshToken(refreshToken);

    const response = h.response({
      status: 'success',
      data: {
        accessToken,
        refreshToken,
      },
    });

    response.code(201);
    return response;
  }

  async putUsersAuthHandler(request, h) {
    const { refreshToken } = request.payload;
    await this._validator.validatePutAuthPayload({ refreshToken });

    await this._authsService.verifyRefreshToken(refreshToken);

    const { id } = await this._tokenManager.verifyRefreshToken(refreshToken);
    const accessToken = await this._tokenManager.generateAccessToken({ id });

    const response = h.response({
      status: 'success',
      data: {
        accessToken,
      },
    });

    response.code(200);
    return response;
  }

  async deleteUsersAuthHandler(request, h) {
    const { refreshToken } = request.payload;
    console.log('request.payload', request.payload);
    console.log('refreshToken', refreshToken);

    await this._validator.validateDeleteAuthPayload(refreshToken);

    await this._authsService.verifyRefreshToken(refreshToken);
    await this._authsService.deleteRefreshToken(refreshToken);

    const response = h.response({
      status: 'success',
      message: 'Refresh token berhasil dihapus.',
    });

    response.code(200);
    return response;
  }
}

module.exports = AuthenticationHandlers;
