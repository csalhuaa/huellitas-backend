// src/api/routes/users.routes.js
const express = require('express');
const router = express.Router();
const { getUserById, updateUser, getUserProfile } = require('../controllers/users.controller');
const { verifySupabaseToken } = require('../middleware/auth.middleware');

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Obtener un usuario por ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario (Supabase UUID)
 *         example: "abc123-def456-ghi789"
 *     responses:
 *       200:
 *         description: Usuario encontrado
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
 *                     user_id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     full_name:
 *                       type: string
 *                     phone_number:
 *                       type: string
 *                     push_notification_token:
 *                       type: string
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Usuario no encontrado
 */
router.get('/:id', verifySupabaseToken, getUserById);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Actualizar datos de un usuario
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *         example: "abc123-def456-ghi789"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               full_name:
 *                 type: string
 *                 example: "Juan Pérez Actualizado"
 *               phone_number:
 *                 type: string
 *                 example: "+51999888777"
 *               push_notification_token:
 *                 type: string
 *                 example: "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]"
 *     responses:
 *       200:
 *         description: Usuario actualizado exitosamente
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
 *                     user_id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     full_name:
 *                       type: string
 *                     phone_number:
 *                       type: string
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Usuario no encontrado
 */
router.put('/:id', verifySupabaseToken, updateUser);

/**
 * @swagger
 * /api/users/{id}/profile:
 *   get:
 *     summary: Obtener perfil completo con estadísticas
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *         example: "abc123-def456-ghi789"
 *     responses:
 *       200:
 *         description: Perfil obtenido exitosamente
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
 *                     user:
 *                       type: object
 *                       properties:
 *                         user_id:
 *                           type: string
 *                         email:
 *                           type: string
 *                         full_name:
 *                           type: string
 *                         phone_number:
 *                           type: string
 *                         created_at:
 *                           type: string
 *                           format: date-time
 *                     stats:
 *                       type: object
 *                       properties:
 *                         lost_reports:
 *                           type: object
 *                           properties:
 *                             total:
 *                               type: integer
 *                             active:
 *                               type: integer
 *                         sightings:
 *                           type: object
 *                           properties:
 *                             total:
 *                               type: integer
 *                         matches:
 *                           type: object
 *                           properties:
 *                             pending:
 *                               type: integer
 *                             confirmed:
 *                               type: integer
 *                     recent_activity:
 *                       type: object
 *                       properties:
 *                         lost_reports:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               report_id:
 *                                 type: string
 *                               pet_name:
 *                                 type: string
 *                               species:
 *                                 type: string
 *                               status:
 *                                 type: string
 *                               created_at:
 *                                 type: string
 *                                 format: date-time
 *                         sightings:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               sighting_id:
 *                                 type: string
 *                               description:
 *                                 type: string
 *                               status:
 *                                 type: string
 *                               created_at:
 *                                 type: string
 *                                 format: date-time
 */
router.get('/:id/profile', verifySupabaseToken, getUserProfile);

module.exports = router;
