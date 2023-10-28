/* eslint-disable camelcase */
const mapDBToModel = ({
  id,
  fullname,
  username,
  password,
  address,
  gender,
  phone_number,
}) => ({
  id,
  fullname,
  username,
  password,
  address,
  gender,
  phoneNumber: phone_number,
});

// const map

module.exports = { mapDBToModel };
