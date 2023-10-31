const { RoomPayloadSchema } = require('./schema');
const InvariantError = require('../../exceptions/InvariantError');

const RoomValidator = {
  validateRoomPayload: (payload) => {
    const roomValidationResult = RoomPayloadSchema.validate(payload);

    if (!roomValidationResult) {
      throw new InvariantError(roomValidationResult.error.message);
    }
  },
};

module.exports = RoomValidator;
