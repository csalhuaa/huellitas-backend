// src/api/controllers/auth.controller.js
const asyncHandler = require('../../utils/asyncHandler');
const logger = require('../../utils/logger');

const { db } = require('../../services/database.service');

/**
 * POST /api/auth/sync
 * Sincronizar usuario de Supabase con nuestra BD
 */
const syncUser = asyncHandler(async (req, res) => {
  const { user_id, email, full_name, phone_number } = req.body;
  
  if (!user_id || !email) {
    return res.status(400).json({
      success: false,
      error: 'user_id y email son requeridos',
    });
  }
  
  // Verificar si ya existe
  const existingUser = await db('users')
    .where('user_id', user_id)
    .first();
  
  if (existingUser) {
    logger.info('Usuario ya existe', { userId: user_id });
    return res.json({ 
      success: true, 
      message: 'Usuario ya existe',
      data: existingUser 
    });
  }
  
  // Crear usuario
  const [user] = await db('users')
    .insert({
      user_id,
      email,
      full_name: full_name || null,
      phone_number: phone_number || null,
    })
    .returning('*');
  
  logger.info('Usuario sincronizado', { userId: user_id });
  
  res.status(201).json({
    success: true,
    message: 'Usuario creado exitosamente',
    data: user,
  });
});

module.exports = {
  syncUser,
};
