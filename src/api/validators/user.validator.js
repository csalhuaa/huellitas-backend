// src/api/validators/user.validator.js
const { body } = require('express-validator');

const createUserValidator = [
  body('user_id')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('user_id es requerido'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email inválido'),
  
  body('full_name')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Nombre debe tener entre 2 y 255 caracteres'),
  
  body('phone_number')
    .optional()
    .isMobilePhone()
    .withMessage('Número de teléfono inválido'),
];

const updateUserValidator = [
  body('full_name')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 2, max: 255 }),
  
  body('phone_number')
    .optional()
    .isMobilePhone(),
  
  body('push_notification_token')
    .optional()
    .isString()
    .trim(),
];

module.exports = {
  createUserValidator,
  updateUserValidator,
};
