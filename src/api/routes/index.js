// src/api/routes/index.js
const express = require('express');
const router = express.Router();

// Importar rutas
const authRoutes = require('./auth.routes');
const usersRoutes = require('./users.routes');
const lostReportsRoutes = require('./lostReports.routes');
const sightingReportsRoutes = require('./sightingReports.routes');
const matchesRoutes = require('./matches.routes');
const mapRoutes = require('./map.routes');
const testRoutes = require('./test.routes');

// Montar rutas
router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/lost-reports', lostReportsRoutes);
router.use('/sighting-reports', sightingReportsRoutes);
router.use('/matches', matchesRoutes);
router.use('/map', mapRoutes);
router.use('/test', testRoutes);

module.exports = router;
