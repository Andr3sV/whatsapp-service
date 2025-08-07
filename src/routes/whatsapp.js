const express = require('express');
const router = express.Router();
const whatsappController = require('../controllers/whatsappController');

// Endpoint de debug temporal
router.get('/debug-env', (req, res) => {
  res.json({
    accountSid: process.env.TWILIO_ACCOUNT_SID ? 'Configurado' : 'NO CONFIGURADO',
    authToken: process.env.TWILIO_AUTH_TOKEN ? 'Configurado' : 'NO CONFIGURADO',
    whatsappNumber: process.env.TWILIO_WHATSAPP_NUMBER || 'NO CONFIGURADO',
    messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID || 'NO CONFIGURADO'
  });
});

// Endpoint de compatibilidad para n8n (redirige a send/text)
router.post('/messages', whatsappController.sendTextMessage);

// Rutas para envío de mensajes
router.post('/send/text', whatsappController.sendTextMessage);
router.post('/send/button', whatsappController.sendButtonMessage);
router.post('/send/list', whatsappController.sendListMessage);
router.post('/send/image', whatsappController.sendImageMessage);
router.post('/send/document', whatsappController.sendDocumentMessage);
router.post('/send/location', whatsappController.sendLocationMessage);
router.post('/send/template', whatsappController.sendTemplateMessage);

// Rutas para gestión de mensajes
router.put('/messages/:messageId/read', whatsappController.markMessageAsRead);

// Rutas para información del servicio
router.get('/status', whatsappController.getServiceStatus);
router.get('/phone-info', whatsappController.getPhoneNumberInfo);
router.get('/templates', whatsappController.getMessageTemplates);

// Rutas para gestión de webhooks de n8n
router.get('/webhooks', whatsappController.getWebhookConfigs);
router.post('/webhooks', whatsappController.addWebhookConfig);
router.put('/webhooks/:phoneNumber', whatsappController.updateWebhookConfig);
router.delete('/webhooks/:phoneNumber', whatsappController.removeWebhookConfig);

module.exports = router; 