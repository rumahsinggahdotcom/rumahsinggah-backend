const fs = require('fs');

class StorageService {
  constructor(folder) {
    this._folder = folder;

    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }
  }

  writeFile(file, filename, section) {
    // const filename = +new Date() + meta.filename;
    // const filename = '1698908338047figure 10.10.png';
    const path = `${this._folder}/${section}/${filename}`;
    console.log(path);

    const fileStream = fs.createWriteStream(path);
    // console.log(fileStream);

    return new Promise((resolve, reject) => {
      fileStream.on('error', (error) => reject(error));
      console.log('eyyy1');
      file.pipe(fileStream);
      file.on('end', () => resolve(filename));
      console.log('eyyy2');
    });
  }

  deleteFile(filename) {
    const path = `${this._folder}/${filename}`;
    fs.unlinkSync(path);
  }
}

module.exports = StorageService;
