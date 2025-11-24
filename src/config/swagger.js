const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Huellitas Backend API',
      version: '1.0.0',
      description: 'API para PetFinder - Plataforma de búsqueda de mascotas perdidas',
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production'
          ? 'https://huellitas-backend-892115920383.us-central1.run.app'
          : 'http://localhost:3000',
        description: process.env.NODE_ENV === 'production' ? 'Producción' : 'Desarrollo'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/api/routes/*.js'],
};

module.exports = swaggerJsdoc(options);
