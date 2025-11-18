// src/utils/logger.js
const config = require('../config/config');

class Logger {
  log(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...meta,
    };
    
    if (config.nodeEnv === 'development') {
      console.log(`[${timestamp}] ${level.toUpperCase()}: ${message}`, meta);
    } else {
      // En producción, usar formato JSON para Cloud Logging
      console.log(JSON.stringify(logEntry));
    }
  }
  
  info(message, meta) {
    this.log('info', message, meta);
  }
  
  error(message, meta) {
    this.log('error', message, meta);
  }
  
  warn(message, meta) {
    this.log('warn', message, meta);
  }
  
  debug(message, meta) {
    if (config.nodeEnv === 'development') {
      this.log('debug', message, meta);
    }
  }
}

module.exports = new Logger();
