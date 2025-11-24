// src/api/routes/test.routes.js
const express = require('express');
const router = express.Router();
const { testUpload } = require('../controllers/test.controller');
const upload = require('../middleware/upload.middleware');
const { verifySupabaseToken } = require('../middleware/auth.middleware');
const { testIaHealth } = require('../controllers/test.controller');
const { testIaMetrics } = require('../controllers/test.controller');
const { testIaAdd } = require('../controllers/test.controller');
const { testIaSearch } = require('../controllers/test.controller');
const { testIaFullFlow } = require('../controllers/test.controller');
const { testNotification } = require('../controllers/test.controller');

/**
 * @swagger
 * /api/test/upload:
 *   post:
 *     summary: Probar subida de imágenes
 *     description: Endpoint de prueba para verificar que Cloud Storage funciona correctamente
 *     tags: [Test]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Imagen a subir (JPEG, PNG, WebP, máximo 10MB)
 *     responses:
 *       201:
 *         description: Imagen subida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Imagen subida exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     url:
 *                       type: string
 *                       example: "https://storage.googleapis.com/huellitas-pet-images/test/1732133456-abc123.jpg"
 *                     originalName:
 *                       type: string
 *                       example: "mi-perro.jpg"
 *                     size:
 *                       type: number
 *                       example: 245678
 *                     mimetype:
 *                       type: string
 *                       example: "image/jpeg"
 *       400:
 *         description: No se proporcionó imagen o formato inválido
 *       401:
 *         description: No autorizado - Token inválido
 */
router.post('/upload', verifySupabaseToken, upload.single('image'), testUpload);

/**
 * @swagger
 * /api/test/ia-health:
 *   get:
 *     summary: Health check de la API IA
 *     tags: [Test]
 *     responses:
 *       200:
 *         description: Estado de los servicios IA
 */
router.get('/ia-health', testIaHealth);

/**
 * @swagger
 * /api/test/ia-metrics:
 *   get:
 *     summary: Métricas del índice vectorial
 *     tags: [Test]
 *     responses:
 *       200:
 *         description: Estadísticas de Pinecone
 */
router.get('/ia-metrics', testIaMetrics);

/**
 * @swagger
 * /api/test/ia-add:
 *   post:
 *     summary: Probar agregar mascota a IA
 *     tags: [Test]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *               pet_id:
 *                 type: string
 *               event_date:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Mascota agregada exitosamente
 */
router.post('/ia-add', verifySupabaseToken, upload.single('image'), testIaAdd);

/**
 * @swagger
 * /api/test/ia-search:
 *   post:
 *     summary: Probar búsqueda de mascotas
 *     tags: [Test]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *               min_event_date:
 *                 type: string
 *                 format: date
 *               max_event_date:
 *                 type: string
 *                 format: date
 *               n_results:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Búsqueda completada
 */
router.post('/ia-search', verifySupabaseToken, upload.single('image'), testIaSearch);

/**
 * @swagger
 * /api/test/ia-full-flow:
 *   post:
 *     summary: Probar flujo completo (Storage + IA + Búsqueda)
 *     tags: [Test]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *               pet_id:
 *                 type: string
 *               event_date:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Flujo completo ejecutado
 */
router.post('/ia-full-flow', verifySupabaseToken, upload.single('image'), testIaFullFlow);

/**
 * @swagger
 * /api/test/notification:
 *   post:
 *     summary: Probar notificación push
 *     tags: [Test]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notificación enviada
 */
router.post('/notification', verifySupabaseToken, testNotification);

module.exports = router;
