// src/api/routes/auth.routes.js
const express = require('express');
const router = express.Router();
const { syncUser } = require('../controllers/auth.controller');
const { verifySupabaseToken } = require('../middleware/auth.middleware');

/**
 * @swagger
 * /api/auth/sync:
 *   post:
 *     summary: Sincronizar usuario de Supabase con el backend
 *     description: Debe llamarse después de que un usuario se registre en Supabase para crear el registro en nuestra base de datos
 *     tags: [Auth]
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
 *                 description: UUID del usuario de Supabase
 *                 example: "550e8400-e29b-41d4-a716-446655440000"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "nuevo@example.com"
 *               full_name:
 *                 type: string
 *                 example: "Nuevo Usuario"
 *               phone_number:
 *                 type: string
 *                 example: "+51987654321"
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente en el backend
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
 *                   example: "Usuario creado exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     user_id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     full_name:
 *                       type: string
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *       200:
 *         description: Usuario ya existe en el backend
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
 *                   example: "Usuario ya existe"
 *                 data:
 *                   type: object
 *       400:
 *         description: Datos requeridos faltantes
 *       401:
 *         description: Token de Supabase inválido
 */
router.post('/sync', verifySupabaseToken, syncUser);

module.exports = router;
