// src/utils/asyncHandler.js
/**
 * Wrapper para manejar errores en funciones async de Express
 * Evita repetir try-catch en cada controller
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = asyncHandler;
