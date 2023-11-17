

class AuthenticationHandlers {
  constructor(authsService, tokenManager, usersService, validator) {
    this._authsService = authsService;
    this._usersService = usersService;
    this._tokenManager = tokenManager;
    this._validator = validator;
  }

  async postAuthenticationsHandler(request, h) {
    const { username, password } = request.payload;
    await this._validator.validatePostAuthPayload({ username, password });
    await this._usersService.verify
    await this._authsService.
  }
}

module.exports = AuthenticationHandlers;
