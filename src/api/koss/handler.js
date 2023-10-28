const autobind = require('auto-bind');

class KossHandler {
  constructor(kossService, imageKossService, storageService, validator) {
    this._kossService = kossService;
    this._imageKossService = imageKossService;
    this._storageService = storageService;
    this._validator = validator;
    autobind(this);
  }

  async postKosHandler(request, h) {
    const { images } = request.payload;
    const {
      ownerId,
      name,
      address,
    } = request.payload;

    await this._validator.validateKosPayload({ ownerId, name, address });
    const kosId = await this._kossService.addKos({ ownerId, name, address });

    if (images) {
      // const kosId = 'test';
      // const kosId = await this._kosService.addKos({ ownerId, name, address });

      // for await(const image of images) {
      //   console.log(image);
      //   // if (Object.prototype.hasOwnProperty.call(image))
      //   await this._validator.validateImageKosPayload(image.hapi.headers);
      //   const filename = await this._storageService.writeFile(image, image.hapi);
      //   const url = `http://${process.env.HOST}:${process.env.PORT}/file/image/${filename}`;
      //   await this._imageKosService.addImageKos(image.hapi.headers);
      // }
      // Object.keys(images).forEach((e) => {
      //   console.log(e);
      // });
      // }
      await Promise.all(images.map(async (image) => {
        await this._validator.validateImageKosPayload(image.hapi.headers);
        const filename = await this._storageService.writeFile(image, image.hapi);
        const url = `http://${process.env.HOST}:${process.env.PORT}/file/image/${filename}`;
        await this._imageKossService.addImageKos(url, kosId);
      }));

      // images.forEach((image) => {
      //   // console.log(element);
      //   await this._validator.validateImageKosPayload(image.hapi.headers);
      //   const filename = await this._storageService.writeFile(image, image.hapi);
      //   const url = `http://${process.env.HOST}:${process.env.PORT}/file/image/${filename}`;
      //   await this._imageKosService.addImageKos(image.hapi.headers);
      // });
    }

    const response = h.response({
      status: 'success',
      message: 'Kos Berhasil Ditambahkan',
      data: {
        kosId,
      },
    });

    response.code(201);
    return response;
  }
}

module.exports = KossHandler;
