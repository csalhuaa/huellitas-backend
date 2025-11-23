// src/api/routes/matches.routes.js
const express = require('express');
const router = express.Router();
const {
  getUserMatches,
  getMatchById,
  updateMatchStatus,
  updateMatch,
  deleteMatch,
} = require('../controllers/matches.controller');
const { verifySupabaseToken } = require('../middleware/auth.middleware');
// const { verifyLocalToken: verifySupabaseToken } = require('../middleware/auth.middleware.local') //parche de validar el token

/**
 * @swagger
 * /api/matches/user/{userId}:
 *   get:
 *     summary: Obtener coincidencias de un usuario
 *     description: Obtiene todas las coincidencias de mascotas perdidas de un usuario con avistamientos
 *     tags: [Matches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario dueño de las mascotas
 *         example: "firebase-uid-12345"
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Pending, Confirmed, Rejected]
 *         description: Filtrar por estado de la coincidencia
 *         example: "Pending"
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
 *         description: Lista de coincidencias del usuario
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
 *                       match_id:
 *                         type: string
 *                         format: uuid
 *                       report_id:
 *                         type: string
 *                         format: uuid
 *                       sighting_id:
 *                         type: string
 *                         format: uuid
 *                       ai_distance_score:
 *                         type: number
 *                         format: float
 *                         description: Puntaje de similitud (0.0 a 1.0)
 *                         example: 0.85
 *                       status:
 *                         type: string
 *                         enum: [Pending, Confirmed, Rejected]
 *                       pet_name:
 *                         type: string
 *                       species:
 *                         type: string
 *                       breed:
 *                         type: string
 *                       owner_user_id:
 *                         type: string
 *                       reporter_user_id:
 *                         type: string
 *                       sighting_date:
 *                         type: string
 *                         format: date-time
 *                       location_text:
 *                         type: string
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
 *                     limit:
 *                       type: integer
 *                     offset:
 *                       type: integer
 *                     count:
 *                       type: integer
 *                     hasMore:
 *                       type: boolean
 *       401:
 *         description: No autorizado
 *       400:
 *         description: Parámetros inválidos
 */
router.get('/user/:userId', verifySupabaseToken, getUserMatches);

/**
 * @swagger
 * /api/matches/{id}:
 *   get:
 *     summary: Obtener una coincidencia por ID
 *     tags: [Matches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la coincidencia
 *         example: "abc123-def456-ghi789"
 *     responses:
 *       200:
 *         description: Coincidencia encontrada
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Coincidencia no encontrada
 */
router.get('/:id', verifySupabaseToken, getMatchById);

/**
 * @swagger
 * /api/matches/{id}/status:
 *   patch:
 *     summary: Actualizar el estado de una coincidencia
 *     description: Solo el dueño de la mascota perdida puede actualizar el estado (Pending → Confirmed/Rejected)
 *     tags: [Matches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la coincidencia
 *         example: "abc123-def456-ghi789"
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
 *                 enum: [Pending, Confirmed, Rejected]
 *                 example: "Confirmed"
 *                 description: "Pending: no revisado | Confirmed: es mi mascota | Rejected: no es mi mascota"
 *     responses:
 *       200:
 *         description: Estado actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     match_id:
 *                       type: string
 *                       format: uuid
 *                     report_id:
 *                       type: string
 *                       format: uuid
 *                     sighting_id:
 *                       type: string
 *                       format: uuid
 *                     ai_distance_score:
 *                       type: number
 *                     status:
 *                       type: string
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Status inválido
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No tienes permiso para actualizar esta coincidencia
 *       404:
 *         description: Coincidencia no encontrada
 */
router.patch('/:id/status', verifySupabaseToken, updateMatchStatus);

/**
 * @swagger
 * /api/matches/{id}:
 *   put:
 *     summary: Actualizar una coincidencia completa
 *     description: Solo el dueño de la mascota puede actualizar. Permite actualizar score y status.
 *     tags: [Matches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la coincidencia
 *         example: "abc123-def456-ghi789"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ai_distance_score:
 *                 type: number
 *                 format: float
 *                 minimum: 0
 *                 maximum: 1
 *                 example: 0.92
 *               status:
 *                 type: string
 *                 enum: [Pending, Confirmed, Rejected]
 *                 example: "Confirmed"
 *     responses:
 *       200:
 *         description: Coincidencia actualizada exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No tienes permiso para actualizar esta coincidencia
 *       404:
 *         description: Coincidencia no encontrada
 */
router.put('/:id', verifySupabaseToken, updateMatch);

/**
 * @swagger
 * /api/matches/{id}:
 *   delete:
 *     summary: Eliminar una coincidencia
 *     description: Solo el dueño de la mascota perdida puede eliminar la coincidencia
 *     tags: [Matches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la coincidencia
 *         example: "abc123-def456-ghi789"
 *     responses:
 *       200:
 *         description: Coincidencia eliminada exitosamente
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No tienes permiso para eliminar esta coincidencia
 *       404:
 *         description: Coincidencia no encontrada
 */
router.delete('/:id', verifySupabaseToken, deleteMatch);

module.exports = router;