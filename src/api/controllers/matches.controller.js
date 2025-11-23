// src/api/controllers/matches.controller.js
const asyncHandler = require('../../utils/asyncHandler');
const logger = require('../../utils/logger');
const { db } = require('../../services/database.service');

/**
 * GET /api/matches/user/:userId
 * Obtener coincidencias de un usuario específico
 */
const getUserMatches = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { status, limit = 50, offset = 0 } = req.query;

  logger.info('Obteniendo coincidencias de usuario', { userId, status });

  // Construir query base con joins para obtener información completa
  let query = db('matches')
    .select(
      'matches.match_id',
      'matches.report_id',
      'matches.sighting_id',
      'matches.ai_distance_score',
      'matches.status',
      'matches.created_at',
      'matches.updated_at',
      // Información del reporte de pérdida
      'lost_pet_reports.pet_name',
      'lost_pet_reports.species',
      'lost_pet_reports.breed',
      'lost_pet_reports.owner_user_id',
      // Información del avistamiento
      'sighting_reports.reporter_user_id',
      'sighting_reports.sighting_date',
      'sighting_reports.location_text'
    )
    .join('lost_pet_reports', 'matches.report_id', 'lost_pet_reports.report_id')
    .join('sighting_reports', 'matches.sighting_id', 'sighting_reports.sighting_id')
    .where('lost_pet_reports.owner_user_id', userId);

  // Filtrar por status si se proporciona
  if (status) {
    const validStatuses = ['Pending', 'Confirmed', 'Rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Status inválido. Valores permitidos: ${validStatuses.join(', ')}`,
      });
    }
    query = query.where('matches.status', status);
  }

  // Ordenar por score más alto y fecha más reciente
  query = query
    .orderBy('matches.ai_distance_score', 'desc')
    .orderBy('matches.created_at', 'desc');

  // Aplicar paginación
  const parsedLimit = parseInt(limit, 10) || 50;
  const parsedOffset = parseInt(offset, 10) || 0;

  query = query.limit(parsedLimit).offset(parsedOffset);

  // Ejecutar query
  const matches = await query;

  // Contar total para paginación
  let countQuery = db('matches')
    .join('lost_pet_reports', 'matches.report_id', 'lost_pet_reports.report_id')
    .where('lost_pet_reports.owner_user_id', userId)
    .count('* as total');

  if (status) {
    countQuery = countQuery.where('matches.status', status);
  }

  const [{ total }] = await countQuery;
  const totalCount = parseInt(total, 10);

  res.json({
    success: true,
    data: matches,
    pagination: {
      total: totalCount,
      limit: parsedLimit,
      offset: parsedOffset,
      count: matches.length,
      hasMore: parsedOffset + matches.length < totalCount,
    },
  });
});

/**
 * GET /api/matches/:id
 * Obtener una coincidencia por ID
 */
const getMatchById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  logger.info('Obteniendo coincidencia', { matchId: id });

  const match = await db('matches')
    .select(
      'matches.*',
      // Información del reporte de pérdida
      'lost_pet_reports.pet_name',
      'lost_pet_reports.species',
      'lost_pet_reports.breed',
      'lost_pet_reports.description as pet_description',
      'lost_pet_reports.owner_user_id',
      'lost_pet_reports.lost_date',
      'lost_pet_reports.status as report_status',
      // Información del avistamiento
      'sighting_reports.reporter_user_id',
      'sighting_reports.description as sighting_description',
      'sighting_reports.sighting_date',
      'sighting_reports.location_text',
      'sighting_reports.status as sighting_status'
    )
    .join('lost_pet_reports', 'matches.report_id', 'lost_pet_reports.report_id')
    .join('sighting_reports', 'matches.sighting_id', 'sighting_reports.sighting_id')
    .where('matches.match_id', id)
    .first();

  if (!match) {
    return res.status(404).json({
      success: false,
      error: 'Coincidencia no encontrada',
    });
  }

  res.json({
    success: true,
    data: match,
  });
});

/**
 * PATCH /api/matches/:id/status
 * Actualizar el estado de una coincidencia
 */
const updateMatchStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const user_id = req.user?.uid;

  logger.info('Actualizando estado de coincidencia', { matchId: id, newStatus: status });

  // Validar que el status sea válido
  const validStatuses = ['Pending', 'Confirmed', 'Rejected'];
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      error: `Status inválido. Valores permitidos: ${validStatuses.join(', ')}`,
    });
  }

  // Verificar que la coincidencia existe
  const match = await db('matches')
    .select('matches.*', 'lost_pet_reports.owner_user_id')
    .join('lost_pet_reports', 'matches.report_id', 'lost_pet_reports.report_id')
    .where('matches.match_id', id)
    .first();

  if (!match) {
    return res.status(404).json({
      success: false,
      error: 'Coincidencia no encontrada',
    });
  }

  // Verificar que el usuario es el dueño del reporte
  if (match.owner_user_id !== user_id) {
    return res.status(403).json({
      success: false,
      error: 'No tienes permiso para actualizar esta coincidencia',
    });
  }

  // Actualizar el estado
  await db('matches')
    .where('match_id', id)
    .update({
      status,
      updated_at: db.fn.now(),
    });

  // Obtener la coincidencia actualizada
  const updatedMatch = await db('matches')
    .where('match_id', id)
    .first();

  logger.info('Estado de coincidencia actualizado', { matchId: id, status });

  res.json({
    success: true,
    data: updatedMatch,
  });
});

/**
 * PUT /api/matches/:id
 * Actualizar una coincidencia completa
 */
const updateMatch = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { ai_distance_score, status } = req.body;
  const user_id = req.user?.uid;

  logger.info('Actualizando coincidencia', { matchId: id });

  // Verificar que la coincidencia existe
  const match = await db('matches')
    .select('matches.*', 'lost_pet_reports.owner_user_id')
    .join('lost_pet_reports', 'matches.report_id', 'lost_pet_reports.report_id')
    .where('matches.match_id', id)
    .first();

  if (!match) {
    return res.status(404).json({
      success: false,
      error: 'Coincidencia no encontrada',
    });
  }

  // Verificar que el usuario es el dueño del reporte
  if (match.owner_user_id !== user_id) {
    return res.status(403).json({
      success: false,
      error: 'No tienes permiso para actualizar esta coincidencia',
    });
  }

  // Preparar datos de actualización
  const updateData = { updated_at: db.fn.now() };

  if (ai_distance_score !== undefined) {
    const score = parseFloat(ai_distance_score);
    if (isNaN(score) || score < 0 || score > 1) {
      return res.status(400).json({
        success: false,
        error: 'ai_distance_score debe estar entre 0.0 y 1.0',
      });
    }
    updateData.ai_distance_score = score;
  }

  if (status !== undefined) {
    const validStatuses = ['Pending', 'Confirmed', 'Rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Status inválido. Valores permitidos: ${validStatuses.join(', ')}`,
      });
    }
    updateData.status = status;
  }

  // Actualizar
  await db('matches')
    .where('match_id', id)
    .update(updateData);

  // Obtener la coincidencia actualizada
  const updatedMatch = await db('matches')
    .where('match_id', id)
    .first();

  logger.info('Coincidencia actualizada', { matchId: id });

  res.json({
    success: true,
    data: updatedMatch,
  });
});

/**
 * DELETE /api/matches/:id
 * Eliminar una coincidencia
 */
const deleteMatch = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user_id = req.user?.uid;

  logger.info('Eliminando coincidencia', { matchId: id });

  // Verificar que la coincidencia existe
  const match = await db('matches')
    .select('matches.*', 'lost_pet_reports.owner_user_id')
    .join('lost_pet_reports', 'matches.report_id', 'lost_pet_reports.report_id')
    .where('matches.match_id', id)
    .first();

  if (!match) {
    return res.status(404).json({
      success: false,
      error: 'Coincidencia no encontrada',
    });
  }

  // Verificar que el usuario es el dueño del reporte
  if (match.owner_user_id !== user_id) {
    return res.status(403).json({
      success: false,
      error: 'No tienes permiso para eliminar esta coincidencia',
    });
  }

  // Eliminar
  await db('matches')
    .where('match_id', id)
    .delete();

  logger.info('Coincidencia eliminada', { matchId: id });

  res.json({
    success: true,
    message: 'Coincidencia eliminada exitosamente',
  });
});

module.exports = {
  getUserMatches,
  getMatchById,
  updateMatchStatus,
  updateMatch,
  deleteMatch,
};