/* eslint-disable camelcase */
const mapDBToModel = ({
  id,
  owner_id,
  user_id,
  kos_id,
  name,
  rating,
  description,
  fullname,
  username,
  password,
  address,
  gender,
  phone_number,
  type,
  max_people,
  price,
  quantity,
  image,
  room_id,
  start,
  end,
  total_price,
  status,
  score,
  review,
  snap_token,
  snap_redirect_url,
}) => ({
  id,
  ownerId: owner_id,
  userId: user_id,
  kosId: kos_id,
  name,
  rating,
  description,
  fullname,
  username,
  password,
  address,
  gender,
  phoneNumber: phone_number,
  type,
  maxPeople: max_people,
  price,
  quantity,
  image,
  roomId: room_id,
  start,
  end,
  totalPrice: total_price,
  status,
  score,
  review,
  snapToken: snap_token,
  snapRedirectUrl: snap_redirect_url,
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
