// src/api/routes/sightingReports.routes.js
const express = require('express');
const router = express.Router();
const { 
  createSighting, 
  getSightings, 
  getSightingById,
  updateSighting,
  deleteSighting 
} = require('../controllers/sightingReports.controller');
const { verifySupabaseToken } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');
// const { verifyLocalToken: verifySupabaseToken } = require('../middleware/auth.middleware.local') //parche de validar el token

/**
 * @swagger
 * /api/sighting-reports:
 *   post:
 *     summary: Crear avistamiento con búsqueda automática de matches
 *     description: Crea un avistamiento con imagen. Busca automáticamente mascotas perdidas similares y notifica a los dueños.
 *     tags: [Sighting Reports]
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
 *               - sighting_date
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Foto del animal avistado
 *               sighting_date:
 *                 type: string
 *                 format: date
 *                 example: "2025-11-23"
 *               description:
 *                 type: string
 *                 example: "Perro callejero color café"
 *               location_text:
 *                 type: string
 *                 example: "Cerca del parque Selva Alegre"
 *     responses:
 *       201:
 *         description: Sighting creado con matches encontrados
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
 *                     sighting:
 *                       type: object
 *                     image:
 *                       type: object
 *                     matches_found:
 *                       type: integer
 *                     matches:
 *                       type: array
 */
router.post('/', verifySupabaseToken, upload.single('image'), createSighting);

/**
 * @swagger
 * /api/sighting-reports:
 *   get:
 *     summary: Obtener lista de reportes de avistamientos
 *     tags: [Sighting Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [En_Calle, En_Albergue, Reunido]
 *         description: Filtrar por estado del avistamiento
 *         example: "En_Calle"
 *       - in: query
 *         name: lat
 *         schema:
 *           type: number
 *         description: Latitud para búsqueda geográfica
 *         example: -16.409047
 *       - in: query
 *         name: lng
 *         schema:
 *           type: number
 *         description: Longitud para búsqueda geográfica
 *         example: -71.537451
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *         description: Radio de búsqueda en metros
 *         example: 5000
 *       - in: query
 *         name: date_from
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Fecha inicial del rango
 *         example: "2025-01-01T00:00:00Z"
 *       - in: query
 *         name: date_to
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Fecha final del rango
 *         example: "2025-01-31T23:59:59Z"
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Número máximo de resultados
 *         example: 20
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Número de resultados a omitir
 *         example: 0
 *     responses:
 *       200:
 *         description: Lista de reportes de avistamientos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       sighting_id:
 *                         type: string
 *                         format: uuid
 *                       reporter_user_id:
 *                         type: string
 *                       description:
 *                         type: string
 *                       status:
 *                         type: string
 *                         enum: [En_Calle, En_Albergue, Reunido]
 *                       sighting_date:
 *                         type: string
 *                         format: date-time
 *                       longitude:
 *                         type: number
 *                       latitude:
 *                         type: number
 *                       location_text:
 *                         type: string
 *                       distance_meters:
 *                         type: number
 *                         description: Solo presente cuando se usa filtro geográfico
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 150
 *                     limit:
 *                       type: integer
 *                       example: 50
 *                     offset:
 *                       type: integer
 *                       example: 0
 *                     count:
 *                       type: integer
 *                       example: 50
 *                     hasMore:
 *                       type: boolean
 *                       example: true
 *       401:
 *         description: No autorizado - Token inválido
 *       400:
 *         description: Parámetros inválidos
 */
router.get('/', verifySupabaseToken, getSightings);

/**
 * @swagger
 * /api/sighting-reports/{id}:
 *   get:
 *     summary: Obtener un reporte de avistamiento por ID
 *     tags: [Sighting Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del reporte de avistamiento
 *         example: "abc123-def456-ghi789"
 *     responses:
 *       200:
 *         description: Reporte de avistamiento encontrado
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Reporte de avistamiento no encontrado
 */
router.get('/:id', verifySupabaseToken, getSightingById);

/**
 * @swagger
 * /api/sighting-reports/{id}:
 *   put:
 *     summary: Actualizar un reporte de avistamiento
 *     description: Solo el creador del reporte puede actualizarlo. Se puede cambiar el status a 'En_Albergue' o 'Reunido'.
 *     tags: [Sighting Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del reporte de avistamiento
 *         example: "abc123-def456-ghi789"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               description:
 *                 type: string
 *                 example: "Perro callejero color café actualizado"
 *               status:
 *                 type: string
 *                 enum: [En_Calle, En_Albergue, Reunido]
 *                 example: "En_Albergue"
 *                 description: "En_Calle: activo en la calle | En_Albergue: rescatado para adopción | Reunido: no se muestra más"
 *               location:
 *                 type: object
 *                 properties:
 *                   lat:
 *                     type: number
 *                     format: float
 *                     example: -16.409047
 *                   lng:
 *                     type: number
 *                     format: float
 *                     example: -71.537451
 *               location_text:
 *                 type: string
 *                 example: "Albergue Municipal de Arequipa"
 *     responses:
 *       200:
 *         description: Reporte de avistamiento actualizado exitosamente
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No tienes permiso para actualizar este reporte
 *       404:
 *         description: Reporte de avistamiento no encontrado
 */
router.put('/:id', verifySupabaseToken, updateSighting);

/**
 * @swagger
 * /api/sighting-reports/{id}:
 *   delete:
 *     summary: Eliminar un reporte de avistamiento
 *     description: Solo el creador del reporte puede eliminarlo
 *     tags: [Sighting Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del reporte de avistamiento
 *         example: "abc123-def456-ghi789"
 *     responses:
 *       200:
 *         description: Reporte de avistamiento eliminado exitosamente
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No tienes permiso para eliminar este reporte
 *       404:
 *         description: Reporte de avistamiento no encontrado
 */
router.delete('/:id', verifySupabaseToken, deleteSighting);

module.exports = router;