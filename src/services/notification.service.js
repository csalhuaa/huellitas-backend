// src/services/notification.service.js
const { Expo } = require('expo-server-sdk');
const { db } = require('./database.service');
const logger = require('../utils/logger');

class NotificationService {
  constructor() {
    this.expo = new Expo();
  }

  /**
   * Verificar si un token es válido de Expo
   */
  isValidExpoToken(token) {
    if (!token) return false;
    return Expo.isExpoPushToken(token);
  }

  /**
   * Enviar notificación push genérica
   */
  async sendPushNotification(token, title, body, data = {}) {
    try {
      if (!this.isValidExpoToken(token)) {
        logger.warn('Token de Expo inválido', { token });
        return { success: false, reason: 'Invalid Expo token' };
      }

      const message = {
        to: token,
        sound: 'default',
        title,
        body,
        data,
        badge: 1,
        priority: 'high',
      };

      const chunks = this.expo.chunkPushNotifications([message]);
      const tickets = [];

      for (const chunk of chunks) {
        const ticketChunk = await this.expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      }

      // Verificar errores
      for (const ticket of tickets) {
        if (ticket.status === 'error') {
          logger.error('Error en ticket de notificación', {
            error: ticket.message,
            details: ticket.details,
          });
          return { success: false, reason: ticket.message };
        }
      }

      logger.info('✅ Notificación enviada', { tickets: tickets.length });
      return { success: true, tickets };

    } catch (error) {
      logger.error('Error enviando notificación', { error: error.message });
      return { success: false, reason: error.message };
    }
  }

  /**
   * Enviar notificación de nuevo match al dueño
   */
  async sendMatchNotification(userId, matchData) {
    try {
      // Obtener token del usuario
      const user = await db('users')
        .select('push_notification_token', 'full_name')
        .where('user_id', userId)
        .first();

      if (!user || !user.push_notification_token) {
        logger.warn('Usuario sin token de notificación', { userId });
        return { success: false, reason: 'No push token' };
      }

      const token = user.push_notification_token;

      if (!this.isValidExpoToken(token)) {
        logger.warn('Token inválido', { userId });
        return { success: false, reason: 'Invalid token' };
      }

      const { match_id, score, pet_name } = matchData;

      const message = {
        to: token,
        sound: 'default',
        title: '🐾 ¡Posible coincidencia encontrada!',
        body: `Alguien reportó haber visto a ${pet_name}. Similitud: ${Math.round(score * 100)}%`,
        data: {
          type: 'new_match',
          match_id: match_id.toString(),
          score: score.toString(),
          pet_name: pet_name || '',
          screen: 'Matches', // Para navegación
        },
        badge: 1,
        priority: 'high',
      };

      const chunks = this.expo.chunkPushNotifications([message]);
      const tickets = [];

      for (const chunk of chunks) {
        const ticketChunk = await this.expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      }

      // Verificar errores y limpiar tokens inválidos
      for (const ticket of tickets) {
        if (ticket.status === 'error') {
          logger.error('Error en notificación de match', {
            userId,
            error: ticket.message,
          });

          // Limpiar token si está expirado
          if (ticket.details?.error === 'DeviceNotRegistered') {
            await db('users')
              .where('user_id', userId)
              .update({ push_notification_token: null });
            
            logger.info('Token expirado eliminado', { userId });
          }

          return { success: false, reason: ticket.message };
        }
      }

      logger.info('✅ Notificación de match enviada', {
        userId,
        matchId: match_id,
      });

      return { success: true, tickets };

    } catch (error) {
      logger.error('Error enviando notificación de match', {
        userId,
        error: error.message,
      });
      return { success: false, reason: error.message };
    }
  }

  /**
   * Enviar notificación cuando match es confirmado
   */
  async sendMatchConfirmedNotification(reporterUserId, matchData) {
    try {
      const user = await db('users')
        .select('push_notification_token')
        .where('user_id', reporterUserId)
        .first();

      if (!user || !user.push_notification_token) {
        return { success: false, reason: 'No push token' };
      }

      const { pet_name, owner_phone } = matchData;

      return await this.sendPushNotification(
        user.push_notification_token,
        '✅ ¡El dueño confirmó que es su mascota!',
        `El dueño de ${pet_name} confirmó la coincidencia. ${owner_phone ? `Contacto: ${owner_phone}` : ''}`,
        {
          type: 'match_confirmed',
          pet_name: pet_name || '',
          owner_phone: owner_phone || '',
          screen: 'Matches',
        }
      );

    } catch (error) {
      logger.error('Error enviando notificación de confirmación', {
        reporterUserId,
        error: error.message,
      });
      return { success: false, reason: error.message };
    }
  }

  /**
   * Enviar notificación de prueba
   */
  async sendTestNotification(userId) {
    try {
      const user = await db('users')
        .select('push_notification_token', 'full_name')
        .where('user_id', userId)
        .first();

      if (!user || !user.push_notification_token) {
        return { success: false, reason: 'No push token' };
      }

      return await this.sendPushNotification(
        user.push_notification_token,
        '🧪 Notificación de prueba',
        `¡Hola ${user.full_name || 'Usuario'}! Las notificaciones funcionan correctamente 🎉`,
        { type: 'test' }
      );

    } catch (error) {
      logger.error('Error enviando notificación de prueba', {
        userId,
        error: error.message,
      });
      return { success: false, reason: error.message };
    }
  }
}

module.exports = new NotificationService();
