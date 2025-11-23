// src/api/controllers/sightingReports.controller.js
const asyncHandler = require('../../utils/asyncHandler');
const logger = require('../../utils/logger');
const {
  db,
  makePoint,
  withinRadius,
  getCoordinates,
} = require('../../services/database.service');

/**
 * POST /api/sighting-reports
 * Crear un nuevo reporte de avistamiento
 */
const createSighting = asyncHandler(async (req, res) => {
  const {
    description,
    sighting_date,
    location, // { lat, lng } or { latitude, longitude }
    location_text,
  } = req.body;

  // El reporter_user_id viene del token verificado
  const reporter_user_id = req.user?.uid;

  // Validaciones
  if (!reporter_user_id) {
    return res.status(401).json({ 
      success: false, 
      error: 'Usuario no autenticado' 
    });
  }

  if (!sighting_date) {
    return res.status(400).json({ 
      success: false, 
      error: 'sighting_date es requerido' 
    });
  }

  // Normalizar coordenadas
  let latitude, longitude;
  if (location && typeof location === 'object') {
    latitude = location.lat ?? location.latitude;
    longitude = location.lng ?? location.longitude;
  }

  logger.info('Creando reporte de avistamiento', { 
    reporter_user_id, 
    hasLocation: !!(latitude && longitude) 
  });

  // Preparar datos para inserción
  // El status siempre es 'En_Calle' al crear
  const insertData = {
    reporter_user_id,
    description: description || null,
    status: 'En_Calle', // Siempre En_Calle al crear
    sighting_date,
    location_text: location_text || null,
  };

  // Si hay coordenadas válidas, crear punto geográfico
  if (latitude !== undefined && longitude !== undefined) {
    insertData.location = makePoint(longitude, latitude);
  }

  // Insertar reporte
  const [sighting] = await db('sighting_reports')
    .insert(insertData)
    .returning('*');

  // Recuperar con coordenadas formateadas usando el helper
  const result = await db('sighting_reports')
    .select('sighting_reports.*', getCoordinates('location'))
    .where('sighting_id', sighting.sighting_id)
    .first();

  // Limpiar respuesta
  const { location: _, ...cleanedResult } = result;

  logger.info('Reporte de avistamiento creado exitosamente', { 
    sightingId: sighting.sighting_id 
  });

  res.status(201).json({
    success: true,
    data: cleanedResult,
  });
});

/**
 * GET /api/sighting-reports
 * Obtener reportes de avistamientos con filtros opcionales
 */
const getSightings = asyncHandler(async (req, res) => {
  const {
    status,
    lat,
    lng,
    radius,
    date_from,
    date_to,
    limit = 50,
    offset = 0,
  } = req.query;

  logger.info('Obteniendo reportes de avistamientos', { 
    status, 
    hasGeoFilter: !!(lat && lng && radius),
    limit,
    offset 
  });

  // Construir query base con el helper getCoordinates
  let query = db('sighting_reports')
    .select(
      'sighting_reports.sighting_id',
      'sighting_reports.reporter_user_id',
      'sighting_reports.description',
      'sighting_reports.status',
      'sighting_reports.sighting_date',
      'sighting_reports.location_text',
      'sighting_reports.created_at',
      'sighting_reports.updated_at',
      getCoordinates('location')
    );

  // Aplicar filtros
  if (status) {
    // Validar que el status sea válido
    const validStatuses = ['En_Calle', 'En_Albergue', 'Reunido'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Status inválido. Valores permitidos: ${validStatuses.join(', ')}`,
      });
    }
    query = query.where('sighting_reports.status', status);
  }

  if (date_from) {
    query = query.where('sighting_reports.sighting_date', '>=', date_from);
  }

  if (date_to) {
    query = query.where('sighting_reports.sighting_date', '<=', date_to);
  }

  // Filtro geográfico y ordenamiento
  const hasGeoFilter = lat !== undefined && lng !== undefined && radius !== undefined;
  
  if (hasGeoFilter) {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const radiusMeters = parseFloat(radius);

    // Validar coordenadas
    if (isNaN(latitude) || isNaN(longitude) || isNaN(radiusMeters)) {
      return res.status(400).json({
        success: false,
        error: 'Coordenadas o radio inválidos',
      });
    }

    // Aplicar filtro de radio usando el helper withinRadius
    query = query.whereRaw(withinRadius('location', longitude, latitude, radiusMeters));

    // Añadir columna de distancia y ordenar por cercanía
    query = query
      .select(
        db.raw(
          'ST_Distance(location::geography, ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography) as distance_meters',
          [longitude, latitude]
        )
      )
      .orderBy('distance_meters', 'asc');
  } else {
    // Sin filtro geográfico, ordenar por fecha más reciente
    query = query.orderBy('sighting_reports.sighting_date', 'desc');
  }

  // Aplicar paginación
  const parsedLimit = parseInt(limit, 10) || 50;
  const parsedOffset = parseInt(offset, 10) || 0;

  query = query.limit(parsedLimit).offset(parsedOffset);

  // Ejecutar query
  const sightings = await query;

  // Contar total para paginación
  let countQuery = db('sighting_reports').count('* as total');

  if (status) {
    countQuery = countQuery.where('status', status);
  }
  if (date_from) {
    countQuery = countQuery.where('sighting_date', '>=', date_from);
  }
  if (date_to) {
    countQuery = countQuery.where('sighting_date', '<=', date_to);
  }
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

  // Limpiar respuesta
  const cleanedSightings = sightings.map(sighting => {
    const { location, ...rest } = sighting;
    return rest;
  });

  res.json({
    success: true,
    data: cleanedSightings,
    pagination: {
      total: totalCount,
      limit: parsedLimit,
      offset: parsedOffset,
      count: cleanedSightings.length,
      hasMore: parsedOffset + cleanedSightings.length < totalCount,
    },
  });
});

/**
 * GET /api/sighting-reports/:id
 * Obtener un reporte de avistamiento por ID
 */
const getSightingById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  logger.info('Obteniendo reporte de avistamiento', { sightingId: id });

  const sighting = await db('sighting_reports')
    .select('sighting_reports.*', getCoordinates('location'))
    .where('sighting_id', id)
    .first();

  if (!sighting) {
    return res.status(404).json({
      success: false,
      error: 'Reporte de avistamiento no encontrado',
    });
  }

  // Limpiar respuesta
  const { location, ...cleanedSighting } = sighting;

  res.json({
    success: true,
    data: cleanedSighting,
  });
});

/**
 * PUT /api/sighting-reports/:id
 * Actualizar un reporte de avistamiento
 */
const updateSighting = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    description,
    status,
    location,
    location_text,
  } = req.body;

  const reporter_user_id = req.user?.uid;

  logger.info('Actualizando reporte de avistamiento', { 
    sightingId: id, 
    userId: reporter_user_id 
  });

  // Verificar que el reporte existe
  const existingSighting = await db('sighting_reports')
    .where('sighting_id', id)
    .first();

  if (!existingSighting) {
    return res.status(404).json({
      success: false,
      error: 'Reporte de avistamiento no encontrado',
    });
  }

  // Verificar propiedad (solo el creador puede actualizar)
  if (existingSighting.reporter_user_id !== reporter_user_id) {
    return res.status(403).json({
      success: false,
      error: 'No tienes permiso para actualizar este reporte',
    });
  }

  // Preparar datos de actualización
  const updateData = {};

  if (description !== undefined) updateData.description = description;
  
  // Validar status si se proporciona
  if (status !== undefined) {
    const validStatuses = ['En_Calle', 'En_Albergue', 'Reunido'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Status inválido. Valores permitidos: ${validStatuses.join(', ')}`,
      });
    }
    updateData.status = status;
  }
  
  if (location_text !== undefined) updateData.location_text = location_text;

  // Actualizar ubicación si se proporciona
  if (location && typeof location === 'object') {
    const latitude = location.lat ?? location.latitude;
    const longitude = location.lng ?? location.longitude;

    if (latitude !== undefined && longitude !== undefined) {
      updateData.location = makePoint(longitude, latitude);
    }
  }

  updateData.updated_at = db.fn.now();

  // Actualizar
  await db('sighting_reports')
    .where('sighting_id', id)
    .update(updateData);

  // Recuperar con coordenadas formateadas
  const result = await db('sighting_reports')
    .select('sighting_reports.*', getCoordinates('location'))
    .where('sighting_id', id)
    .first();

  // Limpiar respuesta
  const { location: _, ...cleanedResult } = result;

  logger.info('Reporte de avistamiento actualizado', { sightingId: id });

  res.json({
    success: true,
    data: cleanedResult,
  });
});

/**
 * DELETE /api/sighting-reports/:id
 * Eliminar un reporte de avistamiento
 */
const deleteSighting = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const reporter_user_id = req.user?.uid;

  logger.info('Eliminando reporte de avistamiento', { 
    sightingId: id, 
    userId: reporter_user_id 
  });

  // Verificar que el reporte existe
  const existingSighting = await db('sighting_reports')
    .where('sighting_id', id)
    .first();

  if (!existingSighting) {
    return res.status(404).json({
      success: false,
      error: 'Reporte de avistamiento no encontrado',
    });
  }

  // Verificar propiedad (solo el creador puede eliminar)
  if (existingSighting.reporter_user_id !== reporter_user_id) {
    return res.status(403).json({
      success: false,
      error: 'No tienes permiso para eliminar este reporte',
    });
  }

  // Eliminar
  await db('sighting_reports')
    .where('sighting_id', id)
    .delete();

  logger.info('Reporte de avistamiento eliminado', { sightingId: id });

  res.json({
    success: true,
    message: 'Reporte de avistamiento eliminado exitosamente',
  });
});

module.exports = {
  createSighting,
  getSightings,
  getSightingById,
  updateSighting,
  deleteSighting,
};