// knexfile.js
require('dotenv').config();

module.exports = {
  development: {
    client: 'pg',
    connection: {
      // Usamos las variables de entorno para la conexión
      host: process.env.DB_HOST || '127.0.0.1',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'huellitas_dev',
      user: process.env.DB_USER || 'huellitas',
      password: process.env.DB_PASSWORD || 'dev_password_2024'
    },
    migrations: {
      directory: './migrations',
      tableName: 'knex_migrations'
    },
    seeds: {
      directory: './scripts/seeds'
    }
  },

  production: {
    client: 'pg',
    connection: {
      // Para Cloud SQL con Unix Socket o conexión estándar
      host: process.env.DB_SOCKET_PATH || process.env.DB_HOST,
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      directory: './migrations',
      tableName: 'knex_migrations'
    }
  }
};