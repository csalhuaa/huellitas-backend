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
  
  // Insertar en la base de datos
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

module.exports = {
  createUser,
};
