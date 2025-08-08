const twilio = require('twilio');
const logger = require('../utils/logger');

class TwilioService {
  constructor() {
    this.accountSid = process.env.TWILIO_ACCOUNT_SID;
    this.authToken = process.env.TWILIO_AUTH_TOKEN;
    this.whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER;
    this.messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID; // Para Messaging Service

    if (!this.accountSid || !this.authToken || !this.whatsappNumber) {
      logger.error('TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN y TWILIO_WHATSAPP_NUMBER son requeridos');
      throw new Error('Configuración de Twilio incompleta');
    }

    this.client = twilio(this.accountSid, this.authToken);
  }

  async sendTextMessage(to, text, options = {}) {
    try {
      const messageData = {
        body: text,
        to: this.formatWhatsAppNumber(to)
      };

      // Usar Messaging Service SID si está disponible
      const overrideMessagingServiceSid = options.messagingServiceSid;
      const messagingServiceToUse = overrideMessagingServiceSid || this.messagingServiceSid;
      if (messagingServiceToUse) {
        messageData.messagingServiceSid = messagingServiceToUse;
      } else {
        messageData.from = `whatsapp:${this.whatsappNumber}`;
      }

      const message = await this.client.messages.create(messageData);
      
      logger.info(`Mensaje de texto enviado a ${to}: ${text}`);
      return {
        success: true,
        messageId: message.sid,
        status: message.status
      };
    } catch (error) {
      logger.error(`Error enviando mensaje de texto a ${to}:`, error);
      throw error;
    }
  }

  async sendImageMessage(to, imageUrl, caption = '') {
    try {
      const messageData = {
        mediaUrl: [imageUrl],
        from: this.whatsappNumber,
        to: this.formatWhatsAppNumber(to)
      };

      if (caption) {
        messageData.body = caption;
      }

      // Si tenemos Messaging Service SID, usarlo para WhatsApp Business
      if (this.messagingServiceSid) {
        messageData.messagingServiceSid = this.messagingServiceSid;
        delete messageData.from;
      }

      const message = await this.client.messages.create(messageData);
      
      logger.info(`Imagen enviada a ${to}: ${imageUrl}`);
      return {
        success: true,
        messageId: message.sid,
        status: message.status
      };
    } catch (error) {
      logger.error(`Error enviando imagen a ${to}:`, error);
      throw error;
    }
  }

  async sendDocumentMessage(to, documentUrl, filename, caption = '') {
    try {
      const messageData = {
        mediaUrl: [documentUrl],
        from: this.whatsappNumber,
        to: this.formatWhatsAppNumber(to)
      };

      if (caption) {
        messageData.body = caption;
      }

      // Si tenemos Messaging Service SID, usarlo para WhatsApp Business
      if (this.messagingServiceSid) {
        messageData.messagingServiceSid = this.messagingServiceSid;
        delete messageData.from;
      }

      const message = await this.client.messages.create(messageData);
      
      logger.info(`Documento enviado a ${to}: ${filename}`);
      return {
        success: true,
        messageId: message.sid,
        status: message.status
      };
    } catch (error) {
      logger.error(`Error enviando documento a ${to}:`, error);
      throw error;
    }
  }

  async sendLocationMessage(to, latitude, longitude, name = '', address = '') {
    try {
      // WhatsApp Business no soporta ubicaciones directamente, lo enviamos como texto
      const locationText = `📍 Ubicación: ${name || 'Ubicación compartida'}\n` +
                          `Latitud: ${latitude}\n` +
                          `Longitud: ${longitude}` +
                          (address ? `\nDirección: ${address}` : '');

      return await this.sendTextMessage(to, locationText);
    } catch (error) {
      logger.error(`Error enviando ubicación a ${to}:`, error);
      throw error;
    }
  }

  async markMessageAsRead(messageId) {
    try {
      // En WhatsApp Business, los mensajes se marcan como leídos automáticamente
      // cuando se procesan correctamente
      logger.info(`Mensaje ${messageId} marcado como leído automáticamente`);
      return {
        success: true,
        message: 'Mensaje marcado como leído automáticamente'
      };
    } catch (error) {
      logger.error(`Error marcando mensaje como leído:`, error);
      throw error;
    }
  }

  async getAccountInfo() {
    try {
      const account = await this.client.api.accounts(this.accountSid).fetch();
      
      return {
        accountName: account.friendlyName,
        accountStatus: account.status,
        accountType: account.type,
        whatsappNumber: this.whatsappNumber,
        messagingServiceSid: this.messagingServiceSid || 'No configurado',
        environment: this.messagingServiceSid ? 'WhatsApp Business' : 'WhatsApp Sandbox'
      };
    } catch (error) {
      logger.error('Error obteniendo información de la cuenta:', error);
      throw error;
    }
  }

  processIncomingMessage(webhookData) {
    try {
      logger.info('Procesando mensaje entrante de WhatsApp Business:', JSON.stringify(webhookData, null, 2));
      
      // WhatsApp Business envía los datos en un formato diferente
      if (webhookData.Body && webhookData.From) {
        return [{
          from: webhookData.From.replace('whatsapp:', ''),
          to: webhookData.To ? webhookData.To.replace('whatsapp:', '') : this.whatsappNumber,
          body: webhookData.Body,
          type: 'text',
          messageId: webhookData.MessageSid,
          timestamp: webhookData.Timestamp
        }];
      }
      
      // Si no es un mensaje de texto, verificar otros tipos
      if (webhookData.NumMedia && parseInt(webhookData.NumMedia) > 0) {
        return [{
          from: webhookData.From.replace('whatsapp:', ''),
          to: webhookData.To ? webhookData.To.replace('whatsapp:', '') : this.whatsappNumber,
          body: webhookData.Body || '',
          type: this.determineMessageType(webhookData),
          messageId: webhookData.MessageSid,
          timestamp: webhookData.Timestamp,
          mediaUrl: webhookData.MediaUrl0
        }];
      }
      
      return null;
    } catch (error) {
      logger.error('Error procesando mensaje entrante:', error);
      return null;
    }
  }

  determineMessageType(webhookData) {
    if (webhookData.NumMedia && parseInt(webhookData.NumMedia) > 0) {
      const mediaType = webhookData.MediaContentType0;
      if (mediaType.startsWith('image/')) return 'image';
      if (mediaType.startsWith('video/')) return 'video';
      if (mediaType.startsWith('audio/')) return 'audio';
      if (mediaType.includes('pdf') || mediaType.includes('document')) return 'document';
      return 'media';
    }
    return 'text';
  }

  formatWhatsAppNumber(phoneNumber) {
    // Asegurar que el número tenga el formato correcto para WhatsApp
    let formatted = phoneNumber.replace(/\s+/g, '');
    if (!formatted.startsWith('whatsapp:')) {
      formatted = `whatsapp:${formatted}`;
    }
    return formatted;
  }

  async checkServiceStatus() {
    try {
      const account = await this.client.api.accounts(this.accountSid).fetch();
      
      return {
        status: 'online',
        accountStatus: account.status,
        whatsappNumber: this.whatsappNumber,
        messagingServiceSid: this.messagingServiceSid || 'No configurado',
        environment: this.messagingServiceSid ? 'WhatsApp Business' : 'WhatsApp Sandbox',
        features: this.messagingServiceSid ? [
          'Envío de mensajes de texto',
          'Envío de imágenes',
          'Envío de documentos',
          'Recepción de mensajes entrantes',
          'Webhooks de estado',
          'Respuestas automáticas'
        ] : [
          'Envío de mensajes de texto',
          'Envío de imágenes',
          'Envío de documentos',
          'Webhooks de estado (solo)'
        ]
      };
    } catch (error) {
      logger.error('Error verificando estado del servicio:', error);
      return {
        status: 'error',
        error: error.message
      };
    }
  }
}

module.exports = new TwilioService(); 