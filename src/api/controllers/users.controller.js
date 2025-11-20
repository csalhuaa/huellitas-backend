// src/api/controllers/users.controller.js
const asyncHandler = require('../../utils/asyncHandler');
const { db } = require('../../services/database.service');
const logger = require('../../utils/logger');

/**
 * POST /api/users
 * Crear un nuevo usuario
 */
const createUser = asyncHandler(async (req, res) => {
  const { user_id, email, full_name, phone_number } = req.body;
  
  logger.info('Creando usuario', { email });
  
  const [user] = await db('users')
    .insert({
      user_id,
      email,
      full_name,
      phone_number,
    })
    .returning('*');
  
  logger.info('Usuario creado exitosamente', { userId: user.user_id });
  
  res.status(201).json({
    success: true,
    data: user,
  });
});

/**
 * GET /api/users/:id
 * Obtener usuario por ID
 */
const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
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

module.exports = {
  createUser,
  getUserById,
  updateUser,
};
