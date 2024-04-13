const fs = require('fs');

class StorageService {
  constructor(folder) {
    this._folder = folder;

    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }
  }

  writeFile(file, filename, section) {
    // const filename = +new Date() + image.filename;
    const path = `${this._folder}/${section}/${filename}`;

    const fileStream = fs.createWriteStream(path);

    return new Promise((resolve, reject) => {
      fileStream.on('error', (error) => reject(error));
      file.pipe(fileStream);
      file.on('end', () => resolve(filename));
    });
  }

  deleteFile(filename, section) {
    const path = `${this._folder}/${section}/${filename}`;
    fs.unlinkSync(path);
  }
}

module.exports = StorageService;
