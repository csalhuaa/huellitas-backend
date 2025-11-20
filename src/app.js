// src/app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const logger = require('./utils/logger');
const config = require('./config/config');
const routes = require('./api/routes');
const { errorHandler, notFound } = require('./api/middleware/errorHandler.middleware');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

const app = express();

// Middlewares de seguridad y parsing
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
}));

app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Logger de requests (solo en desarrollo)
if (config.nodeEnv === 'development') {
  app.use((req, res, next) => {
    logger.debug(`${req.method} ${req.path}`, {
      query: req.query,
      body: req.body,
    });
    next();
  });
}

// Health check (sin autenticación)
app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  });
});

// Montar rutas principales
app.use('/api', routes);

// Middleware para rutas no encontradas (debe estar después de todas las rutas)
app.use(notFound);

// Middleware de manejo global de errores (debe estar al final)
app.use(errorHandler);

module.exports = app;
