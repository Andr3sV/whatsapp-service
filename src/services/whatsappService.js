const axios = require('axios');
const logger = require('../utils/logger');

class WhatsAppService {
  constructor() {
    this.baseURL = 'https://graph.facebook.com/v18.0';
    this.accessToken = process.env.META_ACCESS_TOKEN;
    this.phoneNumberId = process.env.META_PHONE_NUMBER_ID;
    
    if (!this.accessToken || !this.phoneNumberId) {
      logger.error('META_ACCESS_TOKEN y META_PHONE_NUMBER_ID son requeridos');
      throw new Error('Configuración de Meta incompleta');
    }
  }

  // Enviar mensaje de texto
  async sendTextMessage(to, text) {
    try {
      const payload = {
        messaging_product: 'whatsapp',
        to: to,
        type: 'text',
        text: {
          body: text
        }
      };

      const response = await this.makeRequest('POST', `/${this.phoneNumberId}/messages`, payload);
      logger.info(`Mensaje de texto enviado a ${to}: ${text}`);
      return response;
    } catch (error) {
      logger.error(`Error enviando mensaje de texto a ${to}:`, error.message);
      throw error;
    }
  }

  // Enviar mensaje con botones
  async sendButtonMessage(to, text, buttons) {
    try {
      const payload = {
        messaging_product: 'whatsapp',
        to: to,
        type: 'interactive',
        interactive: {
          type: 'button',
          body: {
            text: text
          },
          action: {
            buttons: buttons.map((button, index) => ({
              type: 'reply',
              reply: {
                id: `btn_${index}`,
                title: button.title
              }
            }))
          }
        }
      };

      const response = await this.makeRequest('POST', `/${this.phoneNumberId}/messages`, payload);
      logger.info(`Mensaje con botones enviado a ${to}`);
      return response;
    } catch (error) {
      logger.error(`Error enviando mensaje con botones a ${to}:`, error.message);
      throw error;
    }
  }

  // Enviar lista de opciones
  async sendListMessage(to, text, sections) {
    try {
      const payload = {
        messaging_product: 'whatsapp',
        to: to,
        type: 'interactive',
        interactive: {
          type: 'list',
          body: {
            text: text
          },
          action: {
            button: 'Ver opciones',
            sections: sections
          }
        }
      };

      const response = await this.makeRequest('POST', `/${this.phoneNumberId}/messages`, payload);
      logger.info(`Mensaje con lista enviado a ${to}`);
      return response;
    } catch (error) {
      logger.error(`Error enviando mensaje con lista a ${to}:`, error.message);
      throw error;
    }
  }

  // Enviar imagen
  async sendImageMessage(to, imageUrl, caption = '') {
    try {
      const payload = {
        messaging_product: 'whatsapp',
        to: to,
        type: 'image',
        image: {
          link: imageUrl,
          caption: caption
        }
      };

      const response = await this.makeRequest('POST', `/${this.phoneNumberId}/messages`, payload);
      logger.info(`Imagen enviada a ${to}`);
      return response;
    } catch (error) {
      logger.error(`Error enviando imagen a ${to}:`, error.message);
      throw error;
    }
  }

  // Enviar documento
  async sendDocumentMessage(to, documentUrl, filename, caption = '') {
    try {
      const payload = {
        messaging_product: 'whatsapp',
        to: to,
        type: 'document',
        document: {
          link: documentUrl,
          caption: caption,
          filename: filename
        }
      };

      const response = await this.makeRequest('POST', `/${this.phoneNumberId}/messages`, payload);
      logger.info(`Documento enviado a ${to}`);
      return response;
    } catch (error) {
      logger.error(`Error enviando documento a ${to}:`, error.message);
      throw error;
    }
  }

  // Enviar ubicación
  async sendLocationMessage(to, latitude, longitude, name = '', address = '') {
    try {
      const payload = {
        messaging_product: 'whatsapp',
        to: to,
        type: 'location',
        location: {
          latitude: latitude,
          longitude: longitude,
          name: name,
          address: address
        }
      };

      const response = await this.makeRequest('POST', `/${this.phoneNumberId}/messages`, payload);
      logger.info(`Ubicación enviada a ${to}`);
      return response;
    } catch (error) {
      logger.error(`Error enviando ubicación a ${to}:`, error.message);
      throw error;
    }
  }

  // Enviar plantilla de mensaje
  async sendTemplateMessage(to, templateName, language = 'es', components = []) {
    try {
      const payload = {
        messaging_product: 'whatsapp',
        to: to,
        type: 'template',
        template: {
          name: templateName,
          language: {
            code: language
          },
          components: components
        }
      };

      const response = await this.makeRequest('POST', `/${this.phoneNumberId}/messages`, payload);
      logger.info(`Plantilla ${templateName} enviada a ${to}`);
      return response;
    } catch (error) {
      logger.error(`Error enviando plantilla a ${to}:`, error.message);
      throw error;
    }
  }

  // Marcar mensaje como leído
  async markMessageAsRead(messageId) {
    try {
      const payload = {
        messaging_product: 'whatsapp',
        status: 'read',
        message_id: messageId
      };

      const response = await this.makeRequest('POST', `/${this.phoneNumberId}/messages`, payload);
      logger.info(`Mensaje ${messageId} marcado como leído`);
      return response;
    } catch (error) {
      logger.error(`Error marcando mensaje como leído:`, error.message);
      throw error;
    }
  }

  // Obtener información del número de teléfono
  async getPhoneNumberInfo() {
    try {
      const response = await this.makeRequest('GET', `/${this.phoneNumberId}`);
      logger.info('Información del número de teléfono obtenida');
      return response;
    } catch (error) {
      logger.error('Error obteniendo información del número de teléfono:', error.message);
      throw error;
    }
  }

  // Obtener plantillas de mensajes
  async getMessageTemplates() {
    try {
      const response = await this.makeRequest('GET', `/${this.phoneNumberId}/message_templates`);
      logger.info('Plantillas de mensajes obtenidas');
      return response;
    } catch (error) {
      logger.error('Error obteniendo plantillas de mensajes:', error.message);
      throw error;
    }
  }

  // Procesar webhook de mensajes entrantes
  processIncomingMessage(webhookData) {
    try {
      const entry = webhookData.entry?.[0];
      if (!entry) {
        logger.warn('No se encontró entrada en el webhook');
        return null;
      }

      const changes = entry.changes?.[0];
      if (!changes || changes.value?.object !== 'whatsapp_business_account') {
        logger.warn('Cambio no válido en el webhook');
        return null;
      }

      const messages = changes.value.messages;
      if (!messages || messages.length === 0) {
        logger.info('No hay mensajes nuevos en el webhook');
        return null;
      }

      const processedMessages = messages.map(message => ({
        id: message.id,
        from: message.from,
        timestamp: message.timestamp,
        type: message.type,
        text: message.text?.body,
        image: message.image,
        document: message.document,
        location: message.location,
        contacts: changes.value.contacts?.[0]
      }));

      logger.info(`Procesados ${processedMessages.length} mensajes entrantes`);
      return processedMessages;
    } catch (error) {
      logger.error('Error procesando mensaje entrante:', error.message);
      throw error;
    }
  }

  // Método privado para hacer requests a la API de Meta
  async makeRequest(method, endpoint, data = null) {
    try {
      const config = {
        method,
        url: `${this.baseURL}${endpoint}`,
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      };

      if (data) {
        config.data = data;
      }

      const response = await axios(config);
      return response.data;
    } catch (error) {
      if (error.response) {
        logger.error('Error en API de Meta:', {
          status: error.response.status,
          data: error.response.data
        });
        throw new Error(`Error de API: ${error.response.data?.error?.message || error.message}`);
      }
      throw error;
    }
  }
}

module.exports = new WhatsAppService(); 