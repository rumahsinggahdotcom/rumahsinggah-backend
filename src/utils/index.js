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
  image,
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
  image,
});

/* assign images payload to array */
const assignImageToArray = (images) => {
  // console.log(images._data.length);
  // if (!isEmpty(images._data.length)) {
  //   console.log('eyy');
  // }
  // console.log(images.length);
  // console.log(images._data.length);
  let arrayImgs = [];
  if (!Array.isArray(images)) {
    if (images._data.length > 0) arrayImgs.push(images);
  } else {
    arrayImgs = images;
  }
  return arrayImgs;
};

module.exports = { mapDBToModel, assignImageToArray };
