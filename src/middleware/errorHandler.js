const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log del error
  logger.error(`Error: ${err.message}`, {
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Error de validación de Joi
  if (err.isJoi) {
    const message = err.details.map(detail => detail.message).join(', ');
    error.message = message;
    error.statusCode = 400;
  }

  // Error de Axios (errores de API)
  if (err.isAxiosError) {
    error.message = err.response?.data?.error?.message || err.message;
    error.statusCode = err.response?.status || 500;
  }

  // Error de sintaxis JSON
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    error.message = 'JSON inválido';
    error.statusCode = 400;
  }

  // Error de límite de tamaño
  if (err.code === 'LIMIT_FILE_SIZE') {
    error.message = 'Archivo demasiado grande';
    error.statusCode = 413;
  }

  // Error de límite de requests
  if (err.status === 429) {
    error.message = 'Demasiadas solicitudes';
    error.statusCode = 429;
  }

  // Error de autenticación
  if (err.name === 'UnauthorizedError') {
    error.message = 'Token de acceso inválido';
    error.statusCode = 401;
  }

  // Error de autorización
  if (err.name === 'ForbiddenError') {
    error.message = 'Acceso denegado';
    error.statusCode = 403;
  }

  // Error de recurso no encontrado
  if (err.name === 'CastError') {
    error.message = 'Recurso no encontrado';
    error.statusCode = 404;
  }

  // Error de validación de MongoDB
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error.message = message;
    error.statusCode = 400;
  }

  // Error de duplicación de MongoDB
  if (err.code === 11000) {
    error.message = 'Recurso duplicado';
    error.statusCode = 409;
  }

  // Respuesta de error
  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler; 