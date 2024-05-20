const Jwt = require('@hapi/jwt');
const InvariantError = require('../exceptions/InvariantError');

const TokenManager = {
  generateAccessToken: (payload) => Jwt.token.generate(payload, process.env.ACCESS_TOKEN_KEY),
  generateRefreshToken: (payload) => Jwt.token.generate(payload, process.env.REFRESH_TOKEN_KEY),
  getAccessTokenExp: (accessToken) => {
    jwtDecoded = Jwt.token.decode(accessToken)
    // console.log("jwtDecoded", jwtDecoded)
    accessTokenIat = jwtDecoded.decoded.payload.iat
    accessTokenExp = accessTokenIat + parseInt(process.env.ACCESS_TOKEN_AGE)
    return { accessTokenExp, accessTokenIat }
  },
  verifyRefreshToken: (refreshToken) => {
    try {
      const artifacts = Jwt.token.decode(refreshToken);
      Jwt.token.verifySignature(artifacts, process.env.REFRESH_TOKEN_KEY);
      const { payload } = artifacts.decoded;
      return payload;
    } catch (error) {
      throw new InvariantError('Refresh token tidak valid');
    }
  },
};

module.exports = TokenManager;
