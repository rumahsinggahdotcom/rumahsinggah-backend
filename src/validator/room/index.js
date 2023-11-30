const { RoomsPayloadSchema, ImageRoomsPayloadSchema } = require('./schema');
const InvariantError = require('../../exceptions/InvariantError');

const RoomsValidator = {
  validateRoomPayload: (payload) => {
    const roomValidationResult = RoomsPayloadSchema.validate(payload);

    if (!roomValidationResult) {
      throw new InvariantError(roomValidationResult.error.message);
    }
  },

  validateImageRoomPayload: (payload) => {
    const imageRoomValidationResult = ImageRoomsPayloadSchema.validate(payload);

    if (!imageRoomValidationResult) {
      throw new InvariantError(imageRoomValidationResult.error.message);
    }
  },
};

module.exports = RoomsValidator;
