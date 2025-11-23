// src/api/routes/lostReports.routes.js
const express = require('express');
const router = express.Router();
const { 
  createLostReport, 
  getLostReports, 
  getLostReportById,
  updateLostReportStatus
} = require('../controllers/lostReports.controller');
const upload = require('../middleware/upload.middleware');
const { verifyLocalToken: verifySupabaseToken } = require('../middleware/auth.middleware.local');

/**
 * @swagger
 * /api/lost-reports:
 *   post:
 *     summary: Crear reporte de mascota perdida con imagen
 *     description: Crea un reporte de mascota perdida, sube la imagen a Cloud Storage y la registra en la API de IA para búsquedas futuras.
 *     tags: [Lost Reports]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *               - pet_name
 *               - species
 *               - lost_date
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Foto de la mascota perdida
 *               pet_name:
 *                 type: string
 *                 example: Max
 *               species:
 *                 type: string
 *                 example: Perro
 *               breed:
 *                 type: string
 *                 example: Golden Retriever
 *               description:
 *                 type: string
 *                 example: Perro dorado muy amigable, tiene collar rojo
 *               lost_date:
 *                 type: string
 *                 format: date
 *                 example: "2025-11-20"
 *               last_seen_location_text:
 *                 type: string
 *                 example: Cerca del parque Selva Alegre
 *     responses:
 *       201:
 *         description: Reporte creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     report:
 *                       type: object
 *                     image:
 *                       type: object
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *   get:
 *     summary: Listar reportes de mascotas perdidas
 *     description: Obtiene una lista de reportes con filtros opcionales
 *     tags: [Lost Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Activa, Encontrada]
 *         description: Filtrar por estado del reporte
 *       - in: query
 *         name: species
 *         schema:
 *           type: string
 *         description: Filtrar por especie
 *         example: Perro
 *       - in: query
 *         name: lat
 *         schema:
 *           type: number
 *         description: Latitud para búsqueda geográfica
 *       - in: query
 *         name: lng
 *         schema:
 *           type: number
 *         description: Longitud para búsqueda geográfica
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *         description: Radio en metros para búsqueda geográfica
 *       - in: query
 *         name: date_from
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha mínima de pérdida
 *       - in: query
 *         name: date_to
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha máxima de pérdida
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Número de resultados por página
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Offset para paginación
 *     responses:
 *       200:
 *         description: Lista de reportes obtenida exitosamente
 */
router.post('/', verifySupabaseToken, upload.single('image'), createLostReport);


/**
 * @swagger
 * /api/lost-reports:
 *   get:
 *     summary: Listar reportes de mascotas perdidas
 *     description: Obtiene una lista de reportes con filtros opcionales
 *     tags: [Lost Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Activa, Encontrada]
 *         description: Filtrar por estado del reporte
 *       - in: query
 *         name: species
 *         schema:
 *           type: string
 *         description: Filtrar por especie
 *         example: Perro
 *       - in: query
 *         name: lat
 *         schema:
 *           type: number
 *         description: Latitud para búsqueda geográfica
 *       - in: query
 *         name: lng
 *         schema:
 *           type: number
 *         description: Longitud para búsqueda geográfica
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *         description: Radio en metros para búsqueda geográfica
 *       - in: query
 *         name: date_from
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha mínima de pérdida
 *       - in: query
 *         name: date_to
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha máxima de pérdida
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Número de resultados por página
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Offset para paginación
 *     responses:
 *       200:
 *         description: Lista de reportes obtenida exitosamente
 */
router.get('/', verifySupabaseToken, getLostReports);

/**
 * @swagger
 * /api/lost-reports/{id}:
 *   get:
 *     summary: Obtener un reporte específico
 *     description: Obtiene los detalles completos de un reporte incluyendo imágenes
 *     tags: [Lost Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del reporte
 *     responses:
 *       200:
 *         description: Reporte obtenido exitosamente
 *       404:
 *         description: Reporte no encontrado
 */
router.get('/:id', verifySupabaseToken, getLostReportById);

/**
 * @swagger
 * /api/lost-reports/{id}/status:
 *   patch:
 *     summary: Actualizar estado del reporte
 *     description: Cambia el estado de un reporte (Activa/Encontrada). Solo el dueño puede actualizarlo.
 *     tags: [Lost Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del reporte
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [Activa, Encontrada]
 *                 example: Encontrada
 *     responses:
 *       200:
 *         description: Estado actualizado exitosamente
 *       400:
 *         description: Status inválido
 *       403:
 *         description: No tienes permiso para actualizar este reporte
 *       404:
 *         description: Reporte no encontrado
 */
router.patch('/:id/status', verifySupabaseToken, updateLostReportStatus);

module.exports = router;