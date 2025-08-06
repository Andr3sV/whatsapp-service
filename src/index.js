require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const logger = require('./utils/logger');
const whatsappRoutes = require('./routes/whatsapp');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Configurar trust proxy para ngrok
app.set('trust proxy', 1);

// Configuración de rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // máximo 100 requests por ventana
  message: {
    error: 'Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde.'
  }
});

// Middleware de seguridad
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "http://localhost:3000", "https://6ad8eeec5d94.ngrok-free.app"],
      fontSrc: ["'self'", "https:", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
}));
app.use(cors());
app.use(limiter);

// Middleware para parsing de JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware específico para webhooks de Twilio (form-urlencoded)
app.use('/webhook', express.urlencoded({ extended: false }));

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Logging de requests
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path} - ${req.ip}`);
  
  // Log específico para webhooks
  if (req.path === '/webhook' && req.method === 'POST') {
    logger.info('📥 Webhook POST recibido - Headers:', JSON.stringify(req.headers, null, 2));
    logger.info('📥 Webhook POST recibido - Query:', JSON.stringify(req.query, null, 2));
    logger.info('📥 Webhook POST recibido - Body:', JSON.stringify(req.body, null, 2));
  }
  
  next();
});

// Rutas de salud
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'WhatsApp Service',
    version: '1.0.0'
  });
});

// Ruta para el dashboard
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rutas principales
app.use('/api/whatsapp', whatsappRoutes);

// Ruta para verificar webhook de Meta
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === process.env.META_VERIFY_TOKEN) {
      logger.info('Webhook verificado exitosamente');
      res.status(200).send(challenge);
    } else {
      logger.error('Error en verificación del webhook');
      res.sendStatus(403);
    }
  } else {
    res.sendStatus(400);
  }
});

// Middleware de manejo de errores
app.use(errorHandler);

// Ruta para manejar rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    path: req.originalUrl
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  logger.info(`🚀 Servidor WhatsApp iniciado en puerto ${PORT}`);
  logger.info(`📱 Webhook URL: http://localhost:${PORT}/webhook`);
  logger.info(`🔗 API Base URL: http://localhost:${PORT}/api/whatsapp`);
});

// Manejo de errores no capturados
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

module.exports = app; 