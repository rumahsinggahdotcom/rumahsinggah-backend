const fs = require('fs');

class StorageService {
  constructor(folder, supabase) {
    this._folder = folder;
    this._supabase = supabase;

    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }
  }

  async saveToSupabase(image, filename) {
    await this._supabase.storage.from('rumahsinggahdotcom')
      .upload(`koss/${filename}`, image._data, {
        contentType: "image/jpeg"
      })
  }

  async getPublicUrl(filename, folder){
    const { data } = this._supabase.storage.from('rumahsinggahdotcom').getPublicUrl(`${folder}/${filename}`)
    console.log("data", data);
    return data.publicUrl
  }

  writeFile(file, filename, section) {
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
