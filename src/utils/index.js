/* eslint-disable camelcase */
const mapDBToModel = ({
  id,
  owner_id,
  user_id,
  name,
  rating,
  fullname,
  username,
  password,
  address,
  gender,
  phone_number,
  images,
}) => ({
  id,
  ownerId: owner_id,
  userId: user_id,
  name,
  rating,
  fullname,
  username,
  password,
  address,
  gender,
  phoneNumber: phone_number,
  images,
});

// const map

module.exports = { mapDBToModel };
