// scripts/migrate.js
const knex = require('knex');
const knexConfig = require('../knexfile');

const environment = process.env.NODE_ENV || 'development';
const db = knex(knexConfig[environment]);

console.log(`🔄 Ejecutando migraciones en ambiente: ${environment}`);

db.migrate.latest()
  .then(() => {
    console.log('✅ Migraciones ejecutadas exitosamente');
    return db.migrate.currentVersion();
  })
  .then((version) => {
    console.log(`📌 Versión actual de la BD: ${version}`);
    return db.destroy();
  })
  .catch((error) => {
    console.error('❌ Error ejecutando migraciones:', error);
    process.exit(1);
  });
