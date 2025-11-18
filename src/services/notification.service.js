// src/services/notification.service.js
const config = require('../config/config');

class NotificationService {
  constructor() {
    // TODO: Inicializar Firebase Admin SDK
  }
  
  async sendPushNotification(token, title, body, data = {}) {
    // TODO: Implementar envío de notificación push
    throw new Error('sendPushNotification not implemented');
  }
  
  async sendMatchNotification(userId, matchData) {
    // TODO: Implementar notificación de match específica
    throw new Error('sendMatchNotification not implemented');
  }
}

module.exports = new NotificationService();
