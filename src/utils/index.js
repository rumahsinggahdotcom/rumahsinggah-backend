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

/* assign images payload to array */
const assignImageToArray = (images) => {
  let arrayImgs = [];
  if (images.length > 1) {
    arrayImgs = images;
  } else {
    arrayImgs.push(images);
  }

  return arrayImgs;
};

module.exports = { mapDBToModel, assignImageToArray };
