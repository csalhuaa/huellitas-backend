// src/api/controllers/test.controller.js
const asyncHandler = require('../../utils/asyncHandler');
const storageService = require('../../services/storage.service');
const iaApiService = require('../../services/iaApi.service');
const logger = require('../../utils/logger');
const notificationService = require('../../services/notification.service');

/**
 * POST /api/test/upload
 * Probar subida a Cloud Storage
 */
const testUpload = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: 'No se proporcionó ninguna imagen',
    });
  }
  
  logger.info('Probando upload', {
    filename: req.file.originalname,
    size: req.file.size,
  });
  
  const uniqueFilename = storageService.generateUniqueFilename(req.file.originalname);
  const destinationPath = `test/${uniqueFilename}`;
  
  const imageUrl = await storageService.uploadImage(req.file, destinationPath);
  
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

/**
 * GET /api/test/ia-health
 * Probar health check de la API IA
 */
const testIaHealth = asyncHandler(async (req, res) => {
  const health = await iaApiService.healthCheck();
  
  res.json({
    success: true,
    data: health,
  });
});

/**
 * GET /api/test/ia-metrics
 * Probar métricas de la API IA
 */
const testIaMetrics = asyncHandler(async (req, res) => {
  const metrics = await iaApiService.getMetrics();
  
  res.json({
    success: true,
    data: metrics,
  });
});

/**
 * POST /api/test/ia-add
 * Probar agregar mascota a la IA
 */
const testIaAdd = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: 'Falta imagen',
    });
  }
  
  const petId = req.body.pet_id || `test-pet-${Date.now()}`;
  const eventDate = req.body.event_date || new Date().toISOString().split('T')[0];
  
  logger.info('Probando agregar mascota a IA', { petId, eventDate });
  
  // Agregar a IA usando el buffer de multer
  const result = await iaApiService.addPet(req.file.buffer, petId, eventDate);
  
  res.json({
    success: true,
    message: result.duplicate 
      ? 'Imagen duplicada (ya existe)' 
      : 'Mascota agregada a IA exitosamente',
    data: result,
  });
});

/**
 * POST /api/test/ia-search
 * Probar búsqueda de mascotas similares
 */
const testIaSearch = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: 'Falta imagen',
    });
  }
  
  const minEventDate = req.body.min_event_date;
  const maxEventDate = req.body.max_event_date;
  const nResults = parseInt(req.body.n_results) || 10;
  
  logger.info('Probando búsqueda de mascotas', { 
    minEventDate, 
    maxEventDate, 
    nResults 
  });
  
  // Buscar usando el buffer de multer
  const matches = await iaApiService.searchSimilarPets(req.file.buffer, {
    minEventDate,
    maxEventDate,
    nResults,
  });
  
  res.json({
    success: true,
    message: `Encontrados ${matches.length} matches`,
    data: {
      matches,
      count: matches.length,
    },
  });
});

/**
 * POST /api/test/ia-full-flow
 * Probar flujo completo: Storage + IA + Búsqueda
 */
const testIaFullFlow = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: 'Falta imagen',
    });
  }
  
  const petId = req.body.pet_id || `test-pet-${Date.now()}`;
  const eventDate = req.body.event_date || new Date().toISOString().split('T')[0];
  
  logger.info('🔥 Probando flujo completo', { petId, eventDate });
  
  const results = {};
  
  // 1. Subir a Cloud Storage
  logger.info('1️⃣ Subiendo a Cloud Storage...');
  const uniqueFilename = storageService.generateUniqueFilename(req.file.originalname);
  const destinationPath = `test/${uniqueFilename}`;
  const imageUrl = await storageService.uploadImage(req.file, destinationPath);
  results.storage = { url: imageUrl };
  
  // 2. Agregar a IA
  logger.info('2️⃣ Agregando a API IA...');
  const iaAddResult = await iaApiService.addPet(req.file.buffer, petId, eventDate);
  results.iaAdd = iaAddResult;
  
  // 3. Buscar similares
  logger.info('3️⃣ Buscando similares...');
  const matches = await iaApiService.searchSimilarPets(req.file.buffer, {
    nResults: 5,
  });
  results.iaSearch = {
    matches,
    count: matches.length,
  };
  
  logger.info('✅ Flujo completo exitoso');
  
  res.json({
    success: true,
    message: 'Flujo completo ejecutado exitosamente',
    data: results,
  });
});

/**
 * POST /api/test/notification
 */
const testNotification = asyncHandler(async (req, res) => {
  const userId = req.user?.uid;

  if (!userId) {
    return res.status(401).json({
      success: false,
      error: 'Usuario no autenticado',
    });
  }

  const result = await notificationService.sendTestNotification(userId);

  if (result.success) {
    res.json({
      success: true,
      message: 'Notificación enviada',
      data: result,
    });
  } else {
    res.status(500).json({
      success: false,
      error: result.reason,
    });
  }
});

module.exports = {
  testUpload,
  testIaHealth,
  testIaMetrics,
  testIaAdd,
  testIaSearch,
  testIaFullFlow,
  testNotification,
};
