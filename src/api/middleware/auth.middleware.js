// src/api/middleware/auth.middleware.js
const logger = require('../../utils/logger');

/**
 * Middleware para verificar token de Firebase Auth
 */
const verifyFirebaseToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Token no proporcionado',
      });
    }
    
    const token = authHeader.split('Bearer ')[1];
    
    // TODO: Verificar token con Firebase Admin SDK
    // const decodedToken = await admin.auth().verifyIdToken(token);
    // req.user = decodedToken;
    
    // Por ahora, simulamos la verificación
    req.user = { uid: 'test-user-id' };
    
    next();
  } catch (error) {
    logger.error('Error verificando token', { error: error.message });
    res.status(401).json({
      success: false,
      error: 'Token inválido',
    });
  }
};

module.exports = { verifyFirebaseToken };
