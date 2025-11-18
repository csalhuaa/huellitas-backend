// src/services/iaApi.service.js
const axios = require('axios');
const config = require('../config/config');

class IaApiService {
  constructor() {
    this.baseUrl = config.iaApi.url;
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000,
    });
  }
  
  async addPetImage(imageUrl, metadata = {}) {
    // TODO: Llamar a /add_pet/ de la API IA
    throw new Error('addPetImage not implemented');
  }
  
  async searchSimilarPets(imageUrl, filters = {}) {
    // TODO: Llamar a /search_pet/ de la API IA
    throw new Error('searchSimilarPets not implemented');
  }
  
  async deleteVector(vectorId) {
    // TODO: Eliminar vector de Pinecone
    throw new Error('deleteVector not implemented');
  }
}

module.exports = new IaApiService();
