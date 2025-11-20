// src/api/routes/users.routes.js
const express = require('express');
const router = express.Router();
const { createUser, getUserById, updateUser} = require('../controllers/users.controller');
const { verifySupabaseToken } = require('../middleware/auth.middleware');

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Crear un nuevo usuario
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - email
 *             properties:
 *               user_id:
 *                 type: string
 *                 example: "firebase-uid-12345"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "usuario@example.com"
 *               full_name:
 *                 type: string
 *                 example: "Juan Pérez"
 *               phone_number:
 *                 type: string
 *                 example: "+51987654321"
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
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
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: No autorizado - Token inválido
 *       409:
 *         description: Usuario ya existe
 */
router.post('/', verifySupabaseToken, createUser);

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

module.exports = router;
