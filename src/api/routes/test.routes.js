// src/api/routes/test.routes.js
const express = require('express');
const router = express.Router();
const { testUpload } = require('../controllers/test.controller');
const upload = require('../middleware/upload.middleware');
const { verifySupabaseToken } = require('../middleware/auth.middleware');

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

module.exports = router;
