// src/api/routes/auth.routes.js
const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/auth.controller');
const { verifyFirebaseToken } = require('../middleware/auth.middleware');

// POST /api/auth/register
router.post('/register', verifyFirebaseToken, register);

// POST /api/auth/login
router.post('/login', verifyFirebaseToken, login);

module.exports = router;
