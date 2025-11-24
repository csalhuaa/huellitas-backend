// src/services/storage.service.js
const { Storage } = require('@google-cloud/storage');
const path = require('path');
const fs = require('fs').promises;
const config = require('../config/config');
const logger = require('../utils/logger');

class StorageService {
  constructor() {
    this.useGCP = !!config.gcp.projectId;
    
    if (this.useGCP) {
      // ⭐ CAMBIO: Manejar JSON desde env var O archivo
      let storageOptions = { projectId: config.gcp.projectId };
      
      if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
        // Producción: JSON desde variable de entorno
        try {
          const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
          storageOptions.credentials = credentials;
          logger.info('✅ Storage configurado con JSON de env var');
        } catch (error) {
          logger.error('Error parseando GOOGLE_APPLICATION_CREDENTIALS_JSON', { error: error.message });
          throw error;
        }
      } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        // Desarrollo: archivo JSON
        storageOptions.keyFilename = process.env.GOOGLE_APPLICATION_CREDENTIALS;
        logger.info('✅ Storage configurado con archivo de credenciales');
      } else {
        throw new Error('GCP credentials not configured');
      }
      
      this.storage = new Storage(storageOptions);
      this.bucket = this.storage.bucket(config.storage.bucket);
      logger.info('✅ Storage bucket inicializado');
    } else {
      this.localStoragePath = path.join(__dirname, '../../uploads');
      this.ensureLocalStorageExists();
      logger.warn('⚠️ Storage usando sistema de archivos local');
    }
  }
  
  async ensureLocalStorageExists() {
    try {
      await fs.mkdir(this.localStoragePath, { recursive: true });
    } catch (error) {
      logger.error('Error creando carpeta uploads', { error: error.message });
    }
  }
  
  async uploadImage(file, destinationPath) {
    try {
      if (this.useGCP) {
        return await this.uploadToGCP(file, destinationPath);
      } else {
        return await this.uploadToLocal(file, destinationPath);
      }
    } catch (error) {
      logger.error('Error subiendo imagen', { 
        error: error.message,
        destination: destinationPath 
      });
      throw error;
    }
  }
  
  async uploadToGCP(file, destinationPath) {
    const blob = this.bucket.file(destinationPath);
    const blobStream = blob.createWriteStream({
      resumable: false,
      metadata: {
        contentType: file.mimetype,
      },
    });
    
    return new Promise((resolve, reject) => {
      blobStream.on('error', (error) => {
        logger.error('Error en stream de GCP', { error: error.message });
        reject(error);
      });
      
      blobStream.on('finish', async () => {
        // await blob.makePublic();
        const publicUrl = `https://storage.googleapis.com/${this.bucket.name}/${destinationPath}`;
        logger.info('✅ Imagen subida a GCP', { url: publicUrl });
        resolve(publicUrl);
      });
      
      blobStream.end(file.buffer);
    });
  }
  
  async uploadToLocal(file, destinationPath) {
    const fullPath = path.join(this.localStoragePath, destinationPath);
    const directory = path.dirname(fullPath);
    
    await fs.mkdir(directory, { recursive: true });
    await fs.writeFile(fullPath, file.buffer);
    
    const publicUrl = `/uploads/${destinationPath}`;
    logger.info('✅ Imagen guardada localmente', { url: publicUrl });
    
    return publicUrl;
  }
  
  async deleteImage(filePath) {
    try {
      if (this.useGCP) {
        await this.bucket.file(filePath).delete();
        logger.info('✅ Imagen eliminada de GCP', { filePath });
      } else {
        const fullPath = path.join(this.localStoragePath, filePath);
        await fs.unlink(fullPath);
        logger.info('✅ Imagen eliminada localmente', { filePath });
      }
    } catch (error) {
      logger.error('Error eliminando imagen', { 
        error: error.message,
        filePath 
      });
      throw error;
    }
  }
  
  generateUniqueFilename(originalName) {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const extension = path.extname(originalName);
    return `${timestamp}-${randomString}${extension}`;
  }
}

module.exports = new StorageService();
