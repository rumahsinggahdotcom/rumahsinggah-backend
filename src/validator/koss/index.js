const InvariantError = require('../../exceptions/InvariantError');
const {
  KosPayloadSchema, KosImageSchema, RoomSchema, RoomNumSchema,
} = require('./schema');

const KossValidator = {
  validateKosPayload: (payload) => {
    const kosValidationResult = KosPayloadSchema.validate(payload);

    if (!kosValidationResult) {
      throw new InvariantError(kosValidationResult.error.message);
    }
  },

  validateImageKosPayload: (payload) => {
    const imageKosValidationResult = KosImageSchema.validate(payload);

    if (!imageKosValidationResult) {
      throw new InvariantError(imageKosValidationResult.error.message);
    }
  },

  validateRoomPayload: (payload) => {
    const roomValidationResult = RoomSchema.validate(payload);

    if (!roomValidationResult) {
      throw new InvariantError(roomValidationResult.error.message);
    }
  },

  validateRoomNumPayload: (payload) => {
    const roomNumValidationResult = RoomNumSchema.validate(payload);

    if (!roomNumValidationResult) {
      throw new InvariantError(roomNumValidationResult.error.message);
    }
  },
};

module.exports = KossValidator;
