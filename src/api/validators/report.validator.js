// src/api/validators/report.validator.js
const { body } = require('express-validator');

const createLostReportValidator = [
  body('pet_name')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 100 }),
  
  body('species')
    .optional()
    .isString()
    .trim()
    .isIn(['Perro', 'Gato', 'Ave', 'Otro'])
    .withMessage('Especie debe ser: Perro, Gato, Ave u Otro'),
  
  body('breed')
    .optional()
    .isString()
    .trim(),
  
  body('description')
    .optional()
    .isString()
    .trim(),
  
  body('lost_date')
    .isISO8601()
    .withMessage('Fecha de pérdida inválida'),
  
  body('longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitud debe estar entre -180 y 180'),
  
  body('latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitud debe estar entre -90 y 90'),
  
  body('last_seen_location_text')
    .optional()
    .isString()
    .trim(),
];

const createSightingValidator = [
  body('description')
    .optional()
    .isString()
    .trim(),
  
  body('sighting_date')
    .isISO8601()
    .withMessage('Fecha de avistamiento inválida'),
  
  body('longitude')
    .isFloat({ min: -180, max: 180 }),
  
  body('latitude')
    .isFloat({ min: -90, max: 90 }),
  
  body('location_text')
    .optional()
    .isString()
    .trim(),
];

module.exports = {
  createLostReportValidator,
  createSightingValidator,
};
