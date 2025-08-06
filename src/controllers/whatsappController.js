const Joi = require('joi');
const twilioService = require('../services/twilioService');
const webhookRouter = require('../services/webhookRouter');
const logger = require('../utils/logger');

// Validación para envío de mensajes
const sendMessageSchema = Joi.object({
  to: Joi.string().pattern(/^\+?\d+$/).required(),
  text: Joi.string().max(4096).required()
});

const sendButtonMessageSchema = Joi.object({
  to: Joi.string().pattern(/^\+?\d+$/).required(),
  text: Joi.string().max(1024).required(),
  buttons: Joi.array().items(
    Joi.object({
      title: Joi.string().max(20).required()
    })
  ).min(1).max(3).required()
});

const sendListMessageSchema = Joi.object({
  to: Joi.string().pattern(/^\+?\d+$/).required(),
  text: Joi.string().max(1024).required(),
  sections: Joi.array().items(
    Joi.object({
      title: Joi.string().max(24).required(),
      rows: Joi.array().items(
        Joi.object({
          id: Joi.string().required(),
          title: Joi.string().max(24).required(),
          description: Joi.string().max(72).optional()
        })
      ).min(1).max(10).required()
    })
  ).min(1).max(10).required()
});

const sendImageSchema = Joi.object({
  to: Joi.string().pattern(/^\+?\d+$/).required(),
  imageUrl: Joi.string().uri().required(),
  caption: Joi.string().max(1024).optional()
});

const sendDocumentSchema = Joi.object({
  to: Joi.string().pattern(/^\+?\d+$/).required(),
  documentUrl: Joi.string().uri().required(),
  filename: Joi.string().required(),
  caption: Joi.string().max(1024).optional()
});

const sendLocationSchema = Joi.object({
  to: Joi.string().pattern(/^\+?\d+$/).required(),
  latitude: Joi.number().min(-90).max(90).required(),
  longitude: Joi.number().min(-180).max(180).required(),
  name: Joi.string().max(255).optional(),
  address: Joi.string().max(255).optional()
});

const sendTemplateSchema = Joi.object({
  to: Joi.string().pattern(/^\+?\d+$/).required(),
  templateName: Joi.string().required(),
  language: Joi.string().default('es'),
  components: Joi.array().optional()
});

class WhatsAppController {
  // Enviar mensaje de texto
  async sendTextMessage(req, res, next) {
    try {
      const { error, value } = sendMessageSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          error: error.details[0].message
        });
      }

      const { to, text } = value;
      const result = await twilioService.sendTextMessage(to, text);
      
      res.status(200).json({
        success: true,
        data: result,
        message: 'Mensaje enviado exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }

  // Enviar mensaje con botones
  async sendButtonMessage(req, res, next) {
    try {
      const { error, value } = sendButtonMessageSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          error: error.details[0].message
        });
      }

      const { to, text, buttons } = value;
      // Twilio no soporta botones nativamente, enviaremos texto con opciones
      const buttonText = text + '\n\n' + buttons.map((btn, i) => `${i+1}. ${btn.title}`).join('\n');
      const result = await twilioService.sendTextMessage(to, buttonText);
      
      res.status(200).json({
        success: true,
        data: result,
        message: 'Mensaje con botones enviado exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }

  // Enviar mensaje con lista
  async sendListMessage(req, res, next) {
    try {
      const { error, value } = sendListMessageSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          error: error.details[0].message
        });
      }

      const { to, text, sections } = value;
      // Twilio no soporta listas nativamente, enviaremos texto con opciones
      const listText = text + '\n\n' + sections.map(section => 
        `${section.title}:\n` + section.rows.map(row => `• ${row.title}`).join('\n')
      ).join('\n\n');
      const result = await twilioService.sendTextMessage(to, listText);
      
      res.status(200).json({
        success: true,
        data: result,
        message: 'Mensaje con lista enviado exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }

  // Enviar imagen
  async sendImageMessage(req, res, next) {
    try {
      const { error, value } = sendImageSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          error: error.details[0].message
        });
      }

      const { to, imageUrl, caption } = value;
      const result = await twilioService.sendImageMessage(to, imageUrl, caption);
      
      res.status(200).json({
        success: true,
        data: result,
        message: 'Imagen enviada exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }

  // Enviar documento
  async sendDocumentMessage(req, res, next) {
    try {
      const { error, value } = sendDocumentSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          error: error.details[0].message
        });
      }

      const { to, documentUrl, filename, caption } = value;
      const result = await twilioService.sendDocumentMessage(to, documentUrl, filename, caption);
      
      res.status(200).json({
        success: true,
        data: result,
        message: 'Documento enviado exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }

  // Enviar ubicación
  async sendLocationMessage(req, res, next) {
    try {
      const { error, value } = sendLocationSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          error: error.details[0].message
        });
      }

      const { to, latitude, longitude, name, address } = value;
      const result = await twilioService.sendLocationMessage(to, latitude, longitude, name, address);
      
      res.status(200).json({
        success: true,
        data: result,
        message: 'Ubicación enviada exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }

  // Enviar plantilla
  async sendTemplateMessage(req, res, next) {
    try {
      const { error, value } = sendTemplateSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          error: error.details[0].message
        });
      }

      const { to, templateName, language, components } = value;
      const result = await twilioService.sendTemplateMessage(to, templateName, language, components);
      
      res.status(200).json({
        success: true,
        data: result,
        message: 'Plantilla enviada exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }

  // Marcar mensaje como leído
  async markMessageAsRead(req, res, next) {
    try {
      const { messageId } = req.params;
      
      if (!messageId) {
        return res.status(400).json({
          success: false,
          error: 'ID del mensaje es requerido'
        });
      }

      const result = await twilioService.markMessageAsRead(messageId);
      
      res.status(200).json({
        success: true,
        data: result,
        message: 'Mensaje marcado como leído'
      });
    } catch (error) {
      next(error);
    }
  }

  // Obtener información del número de teléfono
  async getPhoneNumberInfo(req, res, next) {
    try {
      const result = await twilioService.getAccountInfo();
      
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // Obtener plantillas de mensajes
  async getMessageTemplates(req, res, next) {
    try {
      // Twilio no tiene plantillas como Meta, devolvemos información básica
      const result = {
        message: 'Twilio no usa plantillas como Meta. Puedes enviar mensajes de texto directamente.',
        templates: []
      };
      
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // Procesar webhook de mensajes entrantes
  async processWebhook(req, res, next) {
    try {
      const webhookData = req.body;
      
      logger.info('📥 Webhook recibido:', JSON.stringify(webhookData, null, 2));
      
      if (!webhookData) {
        logger.error('❌ Webhook sin datos');
        return res.status(400).json({
          success: false,
          error: 'Datos del webhook requeridos'
        });
      }



      const processedMessages = twilioService.processIncomingMessage(webhookData);
      
      if (processedMessages && processedMessages.length > 0) {
        logger.info('✅ Mensajes procesados:', JSON.stringify(processedMessages, null, 2));
        
        // Procesar cada mensaje y enviar a n8n
        for (const message of processedMessages) {
          logger.info(`📱 MENSAJE RECIBIDO:`);
          logger.info(`   👤 De: ${message.from}`);
          logger.info(`   📝 Contenido: "${message.body}"`);
          logger.info(`   📅 Timestamp: ${message.timestamp}`);
          logger.info(`   🆔 Message ID: ${message.messageId}`);
          logger.info(`   📋 Tipo: ${message.type}`);
          logger.info(`   ──────────────────────────────`);

          // Enviar a n8n para procesamiento
          try {
            const n8nResult = await webhookRouter.sendToN8n(message.from, message);
            if (n8nResult.success) {
              logger.info(`✅ Mensaje enviado a n8n exitosamente`);
            } else {
              logger.warn(`⚠️ Error enviando a n8n: ${n8nResult.error}`);
            }
          } catch (n8nError) {
            logger.error(`❌ Error enviando a n8n:`, n8nError);
          }
        }
        
        logger.info('🎯 Mensajes procesados y enviados a n8n');
      } else {
        logger.info('ℹ️ No se procesaron mensajes del webhook');
      }

      res.setHeader('Content-Type', 'text/plain');
      res.status(200).send('OK');
    } catch (error) {
      logger.error('❌ Error procesando webhook:', error);
      next(error);
    }
  }

  // Obtener estado del servicio
  async getServiceStatus(req, res, next) {
    try {
      const status = await twilioService.checkServiceStatus();
      status.version = '2.0.0';
      status.features = [
        'Envío de mensajes de texto',
        'Envío de imágenes',
        'Envío de documentos',
        'Envío de ubicaciones (como texto)',
        'Procesamiento de webhooks',
        'Integración con n8n',
        'Webhooks dinámicos por número'
      ];

      // Añadir información de webhooks configurados
      status.n8nWebhooks = webhookRouter.getWebhookConfigs();

      res.status(200).json({
        success: true,
        data: status
      });
    } catch (error) {
      next(error);
    }
  }

  // Obtener configuraciones de webhook
  async getWebhookConfigs(req, res, next) {
    try {
      const configs = webhookRouter.getWebhookConfigs();
      
      res.status(200).json({
        success: true,
        data: configs
      });
    } catch (error) {
      next(error);
    }
  }

  // Añadir configuración de webhook
  async addWebhookConfig(req, res, next) {
    try {
      const { phoneNumber, webhookUrl, name } = req.body;
      
      if (!phoneNumber || !webhookUrl) {
        return res.status(400).json({
          success: false,
          error: 'phoneNumber y webhookUrl son requeridos'
        });
      }

      const config = webhookRouter.addWebhookConfig(phoneNumber, webhookUrl, name);
      
      res.status(201).json({
        success: true,
        data: config,
        message: 'Webhook configurado exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }

  // Actualizar configuración de webhook
  async updateWebhookConfig(req, res, next) {
    try {
      const { phoneNumber } = req.params;
      const updates = req.body;
      
      if (!phoneNumber) {
        return res.status(400).json({
          success: false,
          error: 'phoneNumber es requerido'
        });
      }

      const config = webhookRouter.updateWebhookConfig(phoneNumber, updates);
      
      if (!config) {
        return res.status(404).json({
          success: false,
          error: 'Webhook no encontrado'
        });
      }

      res.status(200).json({
        success: true,
        data: config,
        message: 'Webhook actualizado exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }

  // Eliminar configuración de webhook
  async removeWebhookConfig(req, res, next) {
    try {
      const { phoneNumber } = req.params;
      
      if (!phoneNumber) {
        return res.status(400).json({
          success: false,
          error: 'phoneNumber es requerido'
        });
      }

      const removed = webhookRouter.removeWebhookConfig(phoneNumber);
      
      if (!removed) {
        return res.status(404).json({
          success: false,
          error: 'Webhook no encontrado'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Webhook eliminado exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new WhatsAppController(); 