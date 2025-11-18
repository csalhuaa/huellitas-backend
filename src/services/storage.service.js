// src/services/storage.service.js
const config = require('../config/config');

class StorageService {
  constructor() {
    // TODO: Inicializar cliente de S3/Cloud Storage
    this.bucket = config.storage.bucket;
  }
  
  async uploadImage(file, path) {
    // TODO: Implementar subida de imagen
    throw new Error('uploadImage not implemented');
  }
  
  async deleteImage(path) {
    // TODO: Implementar eliminación de imagen
    throw new Error('deleteImage not implemented');
  }
  
  async getSignedUrl(path, expirationMinutes = 60) {
    // TODO: Implementar URL firmada
    throw new Error('getSignedUrl not implemented');
  }
}

module.exports = new StorageService();
