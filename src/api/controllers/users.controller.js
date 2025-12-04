// src/api/controllers/users.controller.js
const asyncHandler = require('../../utils/asyncHandler');
const { db } = require('../../services/database.service');
const logger = require('../../utils/logger');

/**
 * GET /api/users/:id
 * Obtener usuario por ID
 */
const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (id !== req.user?.uid) {
    return res.status(403).json({
      success: false,
      error: 'No autorizado para ver información de otro usuario'
    });
  }
  
  logger.info('Obteniendo usuario', { userId: id });
  
  const user = await db('users')
    .where('user_id', id)
    .first();
  
  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'Usuario no encontrado',
    });
  }
  
  res.json({
    success: true,
    data: user,
  });
});

/**
 * PUT /api/users/:id
 * Actualizar usuario
 */
const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { full_name, phone_number, push_notification_token } = req.body;

  if (id !== req.user?.uid) {
    return res.status(403).json({
      success: false,
      error: 'No autorizado para actualizar información de otro usuario'
    });
  }
  
  logger.info('Actualizando usuario', { userId: id });
  
  const updateData = {};
  if (full_name !== undefined) updateData.full_name = full_name;
  if (phone_number !== undefined) updateData.phone_number = phone_number;
  if (push_notification_token !== undefined) updateData.push_notification_token = push_notification_token;
  
  updateData.updated_at = db.fn.now();
  
  const [user] = await db('users')
    .where('user_id', id)
    .update(updateData)
    .returning('*');
  
  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'Usuario no encontrado',
    });
  }
  
  logger.info('Usuario actualizado', { userId: id });
  
  res.json({
    success: true,
    data: user,
  });
});

/**
 * GET /api/users/:id/profile
 * Obtener perfil completo con estadísticas E IMÁGENES
 */
const getUserProfile = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Validar ownership
  if (id !== req.user?.uid) {
    return res.status(403).json({
      success: false,
      error: 'No autorizado para ver perfil de otro usuario'
    });
  }

  logger.info('Obteniendo perfil de usuario', { userId: id });

  // 1. Obtener info básica del usuario
  const user = await db('users')
    .where('user_id', id)
    .first();

  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'Usuario no encontrado',
    });
  }

  // 2. Contar reportes de mascotas perdidas
  const [{ total: lostReportsTotal }] = await db('lost_pet_reports')
    .where('owner_user_id', id)
    .count('* as total');

  const [{ active: lostReportsActive }] = await db('lost_pet_reports')
    .where('owner_user_id', id)
    .where('status', 'Activa')
    .count('* as active');

  // 3. Contar avistamientos
  const [{ total: sightingsTotal }] = await db('sighting_reports')
    .where('reporter_user_id', id)
    .count('* as total');

  // 4. Contar matches (como dueño)
  const [{ pending: matchesPending }] = await db('matches')
    .join('lost_pet_reports', 'matches.report_id', 'lost_pet_reports.report_id')
    .where('lost_pet_reports.owner_user_id', id)
    .where('matches.status', 'Pending')
    .count('* as pending');

  const [{ confirmed: matchesConfirmed }] = await db('matches')
    .join('lost_pet_reports', 'matches.report_id', 'lost_pet_reports.report_id')
    .where('lost_pet_reports.owner_user_id', id)
    .where('matches.status', 'Confirmed')
    .count('* as confirmed');

  // ⭐ CAMBIO: Obtener actividad reciente CON IMÁGENES
  const recentLostReports = await db('lost_pet_reports')
    .leftJoin('pet_images', 'lost_pet_reports.report_id', 'pet_images.report_id')
    .select(
      'lost_pet_reports.report_id',
      'lost_pet_reports.pet_name',
      'lost_pet_reports.species',
      'lost_pet_reports.status',
      'lost_pet_reports.created_at',
      'pet_images.s3_url as image_url'
    )
    .where('lost_pet_reports.owner_user_id', id)
    .orderBy('lost_pet_reports.created_at', 'desc')
    .limit(5);

  const recentSightings = await db('sighting_reports')
    .leftJoin('pet_images', 'sighting_reports.sighting_id', 'pet_images.sighting_id')
    .select(
      'sighting_reports.sighting_id',
      'sighting_reports.description',
      'sighting_reports.status',
      'sighting_reports.created_at',
      'pet_images.s3_url as image_url'
    )
    .where('sighting_reports.reporter_user_id', id)
    .orderBy('sighting_reports.created_at', 'desc')
    .limit(5);

  // 6. Construir respuesta
  const profile = {
    user: {
      user_id: user.user_id,
      email: user.email,
      full_name: user.full_name,
      phone_number: user.phone_number,
      created_at: user.created_at,
    },
    stats: {
      lost_reports: {
        total: parseInt(lostReportsTotal),
        active: parseInt(lostReportsActive),
      },
      sightings: {
        total: parseInt(sightingsTotal),
      },
      matches: {
        pending: parseInt(matchesPending),
        confirmed: parseInt(matchesConfirmed),
      },
    },
    recent_activity: {
      lost_reports: recentLostReports,
      sightings: recentSightings,
    },
  };

  res.json({
    success: true,
    data: profile,
  });
});

module.exports = {
  getUserById,
  updateUser,
  getUserProfile,
};
