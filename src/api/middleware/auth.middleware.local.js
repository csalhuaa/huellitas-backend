const logger = require('../../utils/logger');
const { db } = require('../../services/database.service');

// Middleware basado en user_id como token
const verifyLocalToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Token no proporcionado',
      });
    }

    // Aquí el "token" ES simplemente el user_id
    const userId = authHeader.split('Bearer ')[1].trim();

    // Buscar usuario real en la BD
    const user = await db('users')
      .select('user_id', 'email')
      .where('user_id', userId)
      .first();

    if (!user) {
      logger.warn('Token inválido: usuario no encontrado', { userId });
      return res.status(401).json({
        success: false,
        error: 'Token inválido o usuario no existe',
      });
    }

    // Igual que el middleware original
    req.user = {
      uid: user.user_id,
      email: user.email,
    };

    next();

  } catch (error) {
    logger.error('Error en autenticación local', { error: error.message });
    return res.status(500).json({
      success: false,
      error: 'Error interno de autenticación',
    });
  }
};

module.exports = { verifyLocalToken };
