// src/api/middleware/errorHandler.middleware.js
const logger = require('../../utils/logger');
const config = require('../../config/config');

/**
 * Middleware global para manejo de errores
 * Debe estar al final de todos los middlewares y rutas
 */
const errorHandler = (err, req, res, next) => {
  // Log del error
  logger.error('Error en la aplicación', {
    error: err.message,
    stack: config.nodeEnv === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
  });
  
  // Errores de validación de Knex/PostgreSQL
  if (err.code === '23505') {
    return res.status(409).json({
      success: false,
      error: 'El recurso ya existe (duplicado)',
    });
  }
  
  if (err.code === '23503') {
    return res.status(400).json({
      success: false,
      error: 'Referencia inválida (foreign key)',
    });
  }
  
  // Error genérico
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: err.message || 'Error interno del servidor',
    ...(config.nodeEnv === 'development' && { stack: err.stack }),
  });
};

/**
 * Middleware para rutas no encontradas (404)
 */
const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    error: `Ruta no encontrada: ${req.method} ${req.path}`,
  });
};

module.exports = { errorHandler, notFound };
