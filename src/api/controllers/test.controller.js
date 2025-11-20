// src/api/controllers/test.controller.js
const asyncHandler = require('../../utils/asyncHandler');
const storageService = require('../../services/storage.service');
const logger = require('../../utils/logger');

/**
 * POST /api/test/upload
 * Endpoint de prueba para subir imágenes
 */
const testUpload = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: 'No se proporcionó ninguna imagen',
    });
  }
  
  logger.info('Probando upload de imagen', {
    filename: req.file.originalname,
    size: req.file.size,
    mimetype: req.file.mimetype,
  });
  
  // Generar nombre único
  const uniqueFilename = storageService.generateUniqueFilename(req.file.originalname);
  const destinationPath = `test/${uniqueFilename}`;
  
  // Subir a storage
  const imageUrl = await storageService.uploadImage(req.file, destinationPath);
  
  logger.info('✅ Imagen de prueba subida', { url: imageUrl });
  
  res.status(201).json({
    success: true,
    message: 'Imagen subida exitosamente',
    data: {
      url: imageUrl,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
    },
  });
});

module.exports = {
  testUpload,
};
