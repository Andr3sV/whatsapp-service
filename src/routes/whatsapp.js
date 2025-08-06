const express = require('express');
const router = express.Router();
const whatsappController = require('../controllers/whatsappController');

// Rutas para enviar mensajes
router.post('/send/text', whatsappController.sendTextMessage);
router.post('/send/button', whatsappController.sendButtonMessage);
router.post('/send/list', whatsappController.sendListMessage);
router.post('/send/image', whatsappController.sendImageMessage);
router.post('/send/document', whatsappController.sendDocumentMessage);
router.post('/send/location', whatsappController.sendLocationMessage);
router.post('/send/template', whatsappController.sendTemplateMessage);

// Rutas para gestionar mensajes
router.post('/messages/:messageId/read', whatsappController.markMessageAsRead);

// Rutas para obtener información
router.get('/phone-info', whatsappController.getPhoneNumberInfo);
router.get('/templates', whatsappController.getMessageTemplates);
router.get('/status', whatsappController.getServiceStatus);

// Ruta para procesar webhooks de Meta
router.post('/webhook', whatsappController.processWebhook);

module.exports = router; 