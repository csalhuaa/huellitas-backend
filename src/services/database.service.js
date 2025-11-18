// src/services/database.service.js
const knex = require('knex');
const config = require('../config/config');
const knexConfig = require('../../knexfile');

// Determinar el entorno
const environment = config.nodeEnv;

// Crear instancia de Knex
const db = knex(knexConfig[environment]);

// Funciones helper para PostGIS
const dbHelpers = {
  // Crear un punto geográfico
  makePoint: (longitude, latitude) => {
    return db.raw(`ST_SetSRID(ST_MakePoint(?, ?), 4326)`, [longitude, latitude]);
  },
  
  // Buscar dentro de un radio (en metros)
  withinRadius: (column, longitude, latitude, radiusMeters) => {
    return db.raw(
      `ST_DWithin(${column}, ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography, ?)`,
      [longitude, latitude, radiusMeters]
    );
  },
  
  // Calcular distancia entre dos puntos (en metros)
  distance: (column, longitude, latitude) => {
    return db.raw(
      `ST_Distance(${column}, ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography)`,
      [longitude, latitude]
    );
  },
  
  // Extraer coordenadas de un punto
  getCoordinates: (column) => {
    return db.raw(`ST_X(${column}::geometry) as longitude, ST_Y(${column}::geometry) as latitude`);
  },
};

module.exports = { db, ...dbHelpers };
