// src/api/controllers/lostReports.controller.js
const asyncHandler = require('../../utils/asyncHandler');
const logger = require('../../utils/logger');
const {
  db,
  makePoint,
  withinRadius,
  getCoordinates,
} = require('../../services/database.service');
const storageService = require('../../services/storage.service');
const iaApiService = require('../../services/iaApi.service');

/**
 * POST /api/lost-reports
 * Crear un nuevo reporte de mascota perdida CON IMAGEN
 */
const createLostReport = asyncHandler(async (req, res) => {
  const {
    pet_name,
    species,
    breed,
    description,
    lost_date,
    location,
    last_seen_location_text,
  } = req.body;

  const owner_user_id = req.user?.uid;

  // Validaciones
  if (!owner_user_id) {
    return res.status(401).json({ 
      success: false, 
      error: 'Usuario no autenticado' 
    });
  }

  if (!pet_name || !species || !lost_date) {
    return res.status(400).json({ 
      success: false, 
      error: 'pet_name, species y lost_date son requeridos' 
    });
  }

  // Validar formato de fecha
  if (!/^\d{4}-\d{2}-\d{2}/.test(lost_date)) {
    return res.status(400).json({
      success: false,
      error: 'lost_date debe estar en formato YYYY-MM-DD'
    });
  }

  // Validar imagen
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: 'Se requiere una imagen de la mascota'
    });
  }

  // Normalizar coordenadas
  let latitude, longitude;
  if (location && typeof location === 'object') {
    latitude = location.lat ?? location.latitude;
    longitude = location.lng ?? location.longitude;
  }

  logger.info('Creando reporte de mascota perdida', { 
    owner_user_id, 
    pet_name,
    hasLocation: !!(latitude && longitude)
  });

  // Preparar datos para inserción
  const insertData = {
    owner_user_id,
    pet_name,
    species,
    breed: breed || null,
    description: description || null,
    status: 'Activa',
    lost_date,
    last_seen_location_text: last_seen_location_text || null,
  };

  if (latitude !== undefined && longitude !== undefined) {
    insertData.location = makePoint(longitude, latitude);
  }

  // 1. Crear reporte
  const [report] = await db('lost_pet_reports')
    .insert(insertData)
    .returning('*');

  logger.info('Lost report creado', { reportId: report.report_id });

  // 2. Subir imagen a Cloud Storage
  const filename = storageService.generateUniqueFilename(req.file.originalname);
  const storagePath = `lost-pets/${report.report_id}/${filename}`;
  const imageUrl = await storageService.uploadImage(req.file, storagePath);
  
  logger.info('Imagen subida a storage', { url: imageUrl });

  // 3. Agregar a API IA
  const iaResult = await iaApiService.addPet(
    req.file.buffer,
    report.report_id,
    new Date(lost_date).toISOString().split('T')[0]
  );

  logger.info('Imagen agregada a IA', { photoId: iaResult.photo_id });

  // 4. Guardar referencia en pet_images
  const [image] = await db('pet_images')
    .insert({
      s3_url: imageUrl,
      vector_id: iaResult.photo_id,
      report_id: report.report_id
    })
    .returning('*');

  // 5. Recuperar report con coordenadas formateadas
  const result = await db('lost_pet_reports')
    .select('lost_pet_reports.*', getCoordinates('location'))
    .where('report_id', report.report_id)
    .first();

  const { location: _, ...cleanedResult } = result;

  logger.info('Lost report completado', { reportId: report.report_id });

  res.status(201).json({
    success: true,
    data: {
      report: cleanedResult,
      image,
    },
  });
});

/**
 * GET /api/lost-reports
 * Obtener reportes de mascotas perdidas con filtros
 */
const getLostReports = asyncHandler(async (req, res) => {
  const {
    status,
    species,
    lat,
    lng,
    radius,
    date_from,
    date_to,
    limit = 50,
    offset = 0,
  } = req.query;

  logger.info('Obteniendo reportes de mascotas perdidas', { 
    status, 
    species,
    hasGeoFilter: !!(lat && lng && radius)
  });

  let query = db('lost_pet_reports')
  .leftJoin('pet_images', 'lost_pet_reports.report_id', 'pet_images.report_id')
  .select(
    'lost_pet_reports.*',
    getCoordinates('location'),
    'pet_images.image_id',
    'pet_images.s3_url as image_url',  // ← Alias para facilitar
    'pet_images.vector_id'
  );

  // Filtros
  if (status) {
    const validStatuses = ['Activa', 'Encontrada'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Status inválido. Valores: ${validStatuses.join(', ')}`,
      });
    }
    query = query.where('lost_pet_reports.status', status);
  }

  if (species) {
    query = query.where('lost_pet_reports.species', species);
  }

  if (date_from) {
    query = query.where('lost_pet_reports.lost_date', '>=', date_from);
  }

  if (date_to) {
    query = query.where('lost_pet_reports.lost_date', '<=', date_to);
  }

  // Filtro geográfico
  const hasGeoFilter = lat && lng && radius;
  
  if (hasGeoFilter) {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const radiusMeters = parseFloat(radius);

    if (isNaN(latitude) || isNaN(longitude) || isNaN(radiusMeters)) {
      return res.status(400).json({
        success: false,
        error: 'Coordenadas o radio inválidos',
      });
    }

    query = query.whereRaw(withinRadius('location', longitude, latitude, radiusMeters));
    query = query
      .select(
        db.raw(
          'ST_Distance(location::geography, ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography) as distance_meters',
          [longitude, latitude]
        )
      )
      .orderBy('distance_meters', 'asc');
  } else {
    query = query.orderBy('lost_pet_reports.lost_date', 'desc');
  }

  // Paginación
  const parsedLimit = parseInt(limit, 10) || 50;
  const parsedOffset = parseInt(offset, 10) || 0;
  query = query.limit(parsedLimit).offset(parsedOffset);

  const reports = await query;

  // Contar total
  let countQuery = db('lost_pet_reports').count('* as total');
  if (status) countQuery = countQuery.where('status', status);
  if (species) countQuery = countQuery.where('species', species);
  if (date_from) countQuery = countQuery.where('lost_date', '>=', date_from);
  if (date_to) countQuery = countQuery.where('lost_date', '<=', date_to);
  if (hasGeoFilter) {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const radiusMeters = parseFloat(radius);
    countQuery = countQuery.whereRaw(
      withinRadius('location', longitude, latitude, radiusMeters)
    );
  }

  const [{ total }] = await countQuery;
  const totalCount = parseInt(total, 10);

  const cleanedReports = reports.map(report => {
    const { location, ...rest } = report;
    return rest;
  });

  res.json({
    success: true,
    data: cleanedReports,
    pagination: {
      total: totalCount,
      limit: parsedLimit,
      offset: parsedOffset,
      count: cleanedReports.length,
      hasMore: parsedOffset + cleanedReports.length < totalCount,
    },
  });
});

/**
 * GET /api/lost-reports/:id
 * Obtener un reporte por ID
 */
const getLostReportById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  logger.info('Obteniendo lost report', { reportId: id });

  const report = await db('lost_pet_reports')
    .select('lost_pet_reports.*', getCoordinates('location'))
    .where('report_id', id)
    .first();

  if (!report) {
    return res.status(404).json({
      success: false,
      error: 'Reporte no encontrado',
    });
  }

  // Obtener imágenes asociadas
  const images = await db('pet_images')
    .select('image_id', 's3_url', 'vector_id', 'created_at')
    .where('report_id', id);

  const { location, ...cleanedReport } = report;

  res.json({
    success: true,
    data: {
      ...cleanedReport,
      images,
    },
  });
});

/**
 * PATCH /api/lost-reports/:id/status
 * Actualizar el estado de un reporte
 */
const updateLostReportStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const owner_user_id = req.user?.uid;

  logger.info('Actualizando status de lost report', { reportId: id, status });

  const validStatuses = ['Activa', 'Encontrada'];
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      error: `Status inválido. Valores: ${validStatuses.join(', ')}`,
    });
  }

  const report = await db('lost_pet_reports')
    .where('report_id', id)
    .first();

  if (!report) {
    return res.status(404).json({
      success: false,
      error: 'Reporte no encontrado',
    });
  }

  if (report.owner_user_id !== owner_user_id) {
    return res.status(403).json({
      success: false,
      error: 'No tienes permiso para actualizar este reporte',
    });
  }

  await db('lost_pet_reports')
    .where('report_id', id)
    .update({
      status,
      updated_at: db.fn.now(),
    });

  const updatedReport = await db('lost_pet_reports')
    .where('report_id', id)
    .first();

  logger.info('Status actualizado', { reportId: id, status });

  res.json({
    success: true,
    data: updatedReport,
  });
});

module.exports = {
  createLostReport,
  getLostReports,
  getLostReportById,
  updateLostReportStatus,
};
