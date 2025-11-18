// scripts/seed.js
const { db } = require('../src/services/database.service');
const logger = require('../src/utils/logger');

async function seed() {
  try {
    logger.info('🌱 Iniciando seed de base de datos...');
    
    // Insertar usuarios de prueba
    await db('users').insert([
      {
        user_id: 'test-user-1',
        email: 'test1@example.com',
        full_name: 'Usuario de Prueba 1',
        phone_number: '+51987654321',
      },
      {
        user_id: 'test-user-2',
        email: 'test2@example.com',
        full_name: 'Usuario de Prueba 2',
        phone_number: '+51987654322',
      },
    ]);
    
    logger.info('✅ Seed completado exitosamente');
    process.exit(0);
  } catch (error) {
    logger.error('❌ Error en seed', { error: error.message });
    process.exit(1);
  }
}

seed();
