// src/server.js
const app = require('./app');
const config = require('./config/config');
const logger = require('./utils/logger');
const { db } = require('./services/database.service');

// Cloud Run usa PORT automáticamente
const PORT = process.env.PORT || config.port || 8080;

// Verificar conexión a la base de datos
db.raw('SELECT 1')
  .then(() => {
    logger.info('✅ Conexión a base de datos exitosa');
    
    // Iniciar servidor
    const server = app.listen(PORT, '0.0.0.0', () => {
      logger.info(`🚀 Servidor corriendo en puerto ${PORT}`);
      logger.info(`🌍 Entorno: ${config.nodeEnv}`);
      logger.info(`📍 URL: http://localhost:${PORT}`);
    });
    
    // Graceful shutdown para Cloud Run
    process.on('SIGTERM', () => {
      logger.info('⚠️  SIGTERM recibido, cerrando servidor...');
      server.close(() => {
        logger.info('✅ Servidor cerrado');
        db.destroy().then(() => {
          logger.info('✅ Conexión a BD cerrada');
          process.exit(0);
        });
      });
    });
    
  })
  .catch((error) => {
    logger.error('❌ Error conectando a la base de datos', { error: error.message });
    process.exit(1);
  });
