const { RoomPayloadSchema, ImageRoomPayloadSchema } = require('./schema');
const InvariantError = require('../../exceptions/InvariantError');

const RoomValidator = {
  validateRoomPayload: (payload) => {
    const roomValidationResult = RoomPayloadSchema.validate(payload);

    if (!roomValidationResult) {
      throw new InvariantError(roomValidationResult.error.message);
    }
  },

  validateImageRoomPayload: (payload) => {
    const imageRoomValidationResult = ImageRoomPayloadSchema.validate(payload);

    if (!imageRoomValidationResult) {
      throw new InvariantError(imageRoomValidationResult.error.message);
    }
  },
};

module.exports = RoomValidator;
