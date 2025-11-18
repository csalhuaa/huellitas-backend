// src/api/controllers/auth.controller.js
const asyncHandler = require('../../utils/asyncHandler');
const logger = require('../../utils/logger');

/**
 * POST /api/auth/register
 * Registrar un nuevo usuario (después de autenticarse con Firebase)
 */
const register = asyncHandler(async (req, res) => {
  // TODO: Implementar lógica de registro
  logger.info('Registro de usuario', { userId: req.user.uid });
  
  res.status(201).json({
    success: true,
    message: 'Usuario registrado exitosamente',
    data: { userId: req.user.uid },
  });
});

/**
 * POST /api/auth/login
 * Login (el token ya fue verificado por el middleware)
 */
const login = asyncHandler(async (req, res) => {
  // TODO: Implementar lógica de login
  logger.info('Login de usuario', { userId: req.user.uid });
  
  res.json({
    success: true,
    message: 'Login exitoso',
    data: { userId: req.user.uid },
  });
});

module.exports = {
  register,
  login,
};
