// src/api/routes/users.routes.js
const express = require('express');
const router = express.Router();
const { createUser } = require('../controllers/users.controller');
const { verifyFirebaseToken } = require('../middleware/auth.middleware');

// POST /api/users - Crear usuario
router.post('/', createUser); // Sin auth por ahora, lo agregas después

module.exports = router;