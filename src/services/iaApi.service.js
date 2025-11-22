// src/services/iaApi.service.js
const axios = require('axios');
const FormData = require('form-data');
const config = require('../config/config');
const logger = require('../utils/logger');

class IaApiService {
  constructor() {
    this.baseUrl = config.iaApi.url;
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 60000, // 60 segundos (la IA puede tardar)
    });
  }
  
  /**
   * Health check de la API de IA
   * @returns {Object} Estado de los servicios
   */
  async healthCheck() {
    try {
      const response = await this.client.get('/health');
      
      if (response.data.success) {
        logger.info('✅ Health check IA API', { 
          status: response.data.data.status 
        });
        return response.data.data;
      }
      
      throw new Error('Health check falló');
    } catch (error) {
      logger.error('❌ Error en health check IA API', { 
        error: error.message 
      });
      throw error;
    }
  }
  
  /**
   * Obtiene métricas del índice vectorial
   * @returns {Object} Estadísticas de Pinecone
   */
  async getMetrics() {
    try {
      const response = await this.client.get('/metrics');
      
      if (response.data.success) {
        logger.info('✅ Métricas obtenidas', { 
          totalVectors: response.data.data.total_vectors 
        });
        return response.data.data;
      }
      
      throw new Error('No se pudieron obtener métricas');
    } catch (error) {
      logger.error('❌ Error obteniendo métricas', { 
        error: error.message 
      });
      throw error;
    }
  }
  
  /**
   * Agrega una mascota al índice vectorial de Pinecone
   * @param {Buffer} imageBuffer - Buffer de la imagen
   * @param {String} petId - ID único de la mascota (report_id o sighting_id)
   * @param {String} eventDate - Fecha del evento (YYYY-MM-DD)
   * @returns {Object} Respuesta con photo_id y metadatos
   */
  async addPet(imageBuffer, petId, eventDate) {
    try {
      logger.info('Agregando mascota a IA', { petId, eventDate });
      
      // Crear FormData
      const formData = new FormData();
      formData.append('image', imageBuffer, {
        filename: 'pet.jpg',
        contentType: 'image/jpeg',
      });
      
      // Hacer request
      const response = await this.client.post(
        `/add_pet/?pet_id=${encodeURIComponent(petId)}&event_date=${eventDate}`,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
          },
        }
      );
      
      if (response.data.success) {
        const data = response.data.data;
        logger.info('✅ Mascota agregada a IA', { 
          photoId: data.photo_id,
          petId: data.pet_id 
        });
        return data;
      }
      
      throw new Error('addPet no retornó success');
    } catch (error) {
      // Manejar duplicados
      if (error.response?.status === 409) {
        const detail = error.response.data.detail;
        logger.warn('⚠️ Imagen duplicada detectada', { 
          petId,
          existingPhotoId: detail.existing_photo_id 
        });
        
        // Retornar info del duplicado en lugar de error
        return {
          photo_id: detail.existing_photo_id,
          pet_id: petId,
          duplicate: true
        };
      }
      
      logger.error('❌ Error agregando mascota a IA', { 
        error: error.message,
        response: error.response?.data 
      });
      throw error;
    }
  }
  
  /**
   * Busca mascotas similares
   * @param {Buffer|Array<Buffer>} imageBuffers - Buffer(s) de imagen(es)
   * @param {Object} options - Opciones de búsqueda
   * @returns {Array} Lista de matches agrupados por pet_id
   */
  async searchSimilarPets(imageBuffers, options = {}) {
    try {
      // Asegurar que sea array
      const buffers = Array.isArray(imageBuffers) ? imageBuffers : [imageBuffers];
      
      logger.info('Buscando mascotas similares', { 
        numImages: buffers.length,
        minEventDate: options.minEventDate,
        maxEventDate: options.maxEventDate
      });
      
      // Crear FormData
      const formData = new FormData();
      buffers.forEach((buffer, index) => {
        formData.append('images', buffer, {
          filename: `search_${index}.jpg`,
          contentType: 'image/jpeg',
        });
      });
      
      // Construir query params
      const params = new URLSearchParams();
      if (options.minEventDate) {
        params.append('min_event_date', options.minEventDate);
      }
      if (options.maxEventDate) {
        params.append('max_event_date', options.maxEventDate);
      }
      params.append('n_results', options.nResults || 50);
      
      // Hacer request
      const response = await this.client.post(
        `/search_pet/?${params.toString()}`,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
          },
        }
      );
      
      if (response.data.success) {
        const results = response.data.data.results || [];
        
        logger.info('✅ Búsqueda completada', { 
          matches: results.length 
        });
        
        return results;
      }
      
      throw new Error('searchSimilarPets no retornó success');
    } catch (error) {
      logger.error('❌ Error buscando mascotas', { 
        error: error.message,
        response: error.response?.data 
      });
      throw error;
    }
  }
  
  /**
   * Elimina una foto del índice vectorial
   * @param {String} photoId - ID de la foto a eliminar
   * @returns {Object} Confirmación
   */
  async deletePet(photoId) {
    try {
      logger.info('Eliminando foto de IA', { photoId });
      
      const response = await this.client.delete(`/delete_pet/${photoId}`);
      
      if (response.data.success) {
        logger.info('✅ Foto eliminada de IA', { photoId });
        return response.data.data;
      }
      
      throw new Error('deletePet no retornó success');
    } catch (error) {
      logger.error('❌ Error eliminando foto de IA', { 
        error: error.message,
        photoId 
      });
      throw error;
    }
  }
  
  /**
   * Normaliza score de similitud para consistencia
   * Scores mayores = más similar (cosine similarity de Pinecone)
   * @param {Number} score - Score de similitud
   * @returns {Number} Score normalizado (0-1)
   */
  normalizeScore(score) {
    // Ya viene normalizado de Pinecone (0-1, mayor es mejor)
    // Solo asegurar que esté en rango
    return Math.max(0, Math.min(1, score));
  }
}

module.exports = new IaApiService();
