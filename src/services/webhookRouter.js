const axios = require('axios');
const logger = require('../utils/logger');

class WebhookRouter {
  constructor() {
    this.webhookConfigs = new Map();
    this.processedMessages = new Set(); // Para deduplicación
    this.loadWebhookConfigs();
  }

  // Cargar configuraciones de webhooks desde variables de entorno
  loadWebhookConfigs() {
    try {
      // Configuración por defecto para el número principal
      const defaultWebhook = process.env.N8N_DEFAULT_WEBHOOK_URL;
      if (defaultWebhook) {
        this.webhookConfigs.set('+34603960818', {
          url: defaultWebhook,
          name: 'default',
          enabled: true
        });
      }

      // Cargar configuraciones adicionales desde variables de entorno
      // Formato: N8N_WEBHOOK_<NUMBER>_URL
      Object.keys(process.env).forEach(key => {
        if (key.startsWith('N8N_WEBHOOK_') && key.endsWith('_URL')) {
          const number = key.replace('N8N_WEBHOOK_', '').replace('_URL', '');
          const webhookUrl = process.env[key];
          const webhookName = process.env[`N8N_WEBHOOK_${number}_NAME`] || number;
          const enabled = process.env[`N8N_WEBHOOK_${number}_ENABLED`] !== 'false';

          this.webhookConfigs.set(number, {
            url: webhookUrl,
            name: webhookName,
            enabled: enabled
          });

          logger.info(`📡 Webhook configurado para ${number}: ${webhookName} (${enabled ? 'activo' : 'inactivo'})`);
        }
      });

      logger.info(`📡 Total de webhooks configurados: ${this.webhookConfigs.size}`);
    } catch (error) {
      logger.error('❌ Error cargando configuraciones de webhook:', error);
    }
  }

  // Verificar si un mensaje ya fue procesado
  isMessageProcessed(messageId) {
    return this.processedMessages.has(messageId);
  }

  // Marcar mensaje como procesado
  markMessageAsProcessed(messageId) {
    this.processedMessages.add(messageId);

    // Limpiar mensajes antiguos (mantener solo los últimos 1000)
    if (this.processedMessages.size > 1000) {
      const messagesArray = Array.from(this.processedMessages);
      this.processedMessages = new Set(messagesArray.slice(-500));
    }
  }

  // Obtener webhook para un número específico
  getWebhookForNumber(phoneNumber) {
    // Limpiar el número (quitar whatsapp: si existe)
    const cleanNumber = phoneNumber.replace('whatsapp:', '');

    // Buscar configuración exacta
    if (this.webhookConfigs.has(cleanNumber)) {
      const config = this.webhookConfigs.get(cleanNumber);
      if (config.enabled) {
        return config;
      }
    }

    // Si no hay configuración específica, usar la por defecto
    const defaultConfig = this.webhookConfigs.get('+34603960818');
    if (defaultConfig && defaultConfig.enabled) {
      logger.info(`📡 Usando webhook por defecto para ${cleanNumber}`);
      return defaultConfig;
    }

    return null;
  }

  // Enviar mensaje a n8n
  async sendToN8n(phoneNumber, messageData) {
    try {
      // Verificar si el mensaje ya fue procesado
      if (this.isMessageProcessed(messageData.messageId)) {
        logger.info(`🔄 Mensaje ${messageData.messageId} ya procesado, saltando...`);
        return { success: true, skipped: true, reason: 'already_processed' };
      }

      const webhookConfig = this.getWebhookForNumber(phoneNumber);

      if (!webhookConfig) {
        logger.warn(`⚠️ No hay webhook configurado para ${phoneNumber}`);
        return { success: false, error: 'No webhook configured' };
      }

      // Preparar datos para n8n
      const n8nPayload = {
        phoneNumber: phoneNumber.replace('whatsapp:', ''),
        message: messageData,
        timestamp: new Date().toISOString(),
        webhookName: webhookConfig.name,
        source: 'whatsapp-service'
      };

      logger.info(`📤 Enviando a n8n (${webhookConfig.name}): ${phoneNumber}`);

      const response = await axios.post(webhookConfig.url, n8nPayload, {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'WhatsApp-Service/1.0'
        },
        timeout: 10000 // 10 segundos
      });

      // Marcar mensaje como procesado solo si se envió exitosamente
      this.markMessageAsProcessed(messageData.messageId);

      logger.info(`✅ n8n respondió (${webhookConfig.name}): ${response.status}`);
      return { success: true, response: response.data };

    } catch (error) {
      logger.error(`❌ Error enviando a n8n para ${phoneNumber}:`, error.message);
      return { success: false, error: error.message };
    }
  }

  // Obtener todas las configuraciones de webhook
  getWebhookConfigs() {
    const configs = {};
    this.webhookConfigs.forEach((config, number) => {
      configs[number] = {
        ...config,
        url: config.url ? `${config.url.substring(0, 20)}...` : 'No configurado' // Ocultar URL completa
      };
    });
    return configs;
  }

  // Añadir nueva configuración de webhook
  addWebhookConfig(phoneNumber, webhookUrl, name = null) {
    const config = {
      url: webhookUrl,
      name: name || phoneNumber,
      enabled: true
    };

    this.webhookConfigs.set(phoneNumber, config);
    logger.info(`📡 Nuevo webhook añadido para ${phoneNumber}: ${config.name}`);

    return config;
  }

  // Actualizar configuración de webhook
  updateWebhookConfig(phoneNumber, updates) {
    if (this.webhookConfigs.has(phoneNumber)) {
      const currentConfig = this.webhookConfigs.get(phoneNumber);
      const updatedConfig = { ...currentConfig, ...updates };
      this.webhookConfigs.set(phoneNumber, updatedConfig);

      logger.info(`📡 Webhook actualizado para ${phoneNumber}: ${updatedConfig.name}`);
      return updatedConfig;
    }

    return null;
  }

  // Eliminar configuración de webhook
  removeWebhookConfig(phoneNumber) {
    if (this.webhookConfigs.has(phoneNumber)) {
      this.webhookConfigs.delete(phoneNumber);
      logger.info(`📡 Webhook eliminado para ${phoneNumber}`);
      return true;
    }

    return false;
  }
}

module.exports = new WebhookRouter(); 