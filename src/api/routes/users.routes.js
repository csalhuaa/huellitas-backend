// src/api/routes/users.routes.js
const express = require('express');
const router = express.Router();
const { createUser, getUserById, updateUser} = require('../controllers/users.controller');
const { verifyFirebaseToken } = require('../middleware/auth.middleware');

// POST /api/users - Crear usuario
router.post('/', createUser);

// GET /api/users/:id - Obtener usuario por ID
router.get('/:id', getUserById);

// PUT /api/users/:id - Actualizar usuario
router.put('/:id', updateUser);

module.exports = router;