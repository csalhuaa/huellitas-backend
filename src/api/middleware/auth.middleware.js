// src/api/middleware/auth.middleware.js
const { createClient } = require('@supabase/supabase-js');
const logger = require('../../utils/logger');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const verifySupabaseToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Token no proporcionado',
      });
    }
    
    const token = authHeader.split('Bearer ')[1];
    
    // Verificar token con Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      logger.error('Token inválido', { error: error?.message });
      return res.status(401).json({
        success: false,
        error: 'Token inválido o expirado',
      });
    }
    
    // Guardar info del usuario en request
    req.user = {
      uid: user.id,
      email: user.email,
    };
    
    next();
  } catch (error) {
    logger.error('Error en autenticación', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Error de autenticación',
    });
  }
};

module.exports = { verifySupabaseToken };

