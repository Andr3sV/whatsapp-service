#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setupEnvironment() {
  console.log('🚀 Configuración del Servicio WhatsApp Business API\n');
  console.log('Este script te ayudará a configurar las variables de entorno necesarias.\n');

  const envPath = path.join(__dirname, '.env');
  let envContent = '';

  // Verificar si ya existe un archivo .env
  if (fs.existsSync(envPath)) {
    const existingContent = fs.readFileSync(envPath, 'utf8');
    console.log('📁 Archivo .env encontrado. Se actualizará con los nuevos valores.\n');
    envContent = existingContent;
  }

  console.log('📋 Configuración del servidor:');
  const port = await question('Puerto del servidor (default: 3000): ') || '3000';
  const nodeEnv = await question('Entorno (development/production) (default: development): ') || 'development';

  console.log('\n🔑 Configuración de Meta WhatsApp Business API:');
  console.log('Para obtener estos valores, ve a: https://developers.facebook.com/apps/');
  console.log('1. Crea una app o selecciona una existente');
  console.log('2. Agrega el producto "WhatsApp Business API"');
  console.log('3. Configura un número de teléfono de WhatsApp Business\n');

  const metaAppId = await question('META_APP_ID: ');
  const metaAppSecret = await question('META_APP_SECRET: ');
  const metaAccessToken = await question('META_ACCESS_TOKEN: ');
  const metaPhoneNumberId = await question('META_PHONE_NUMBER_ID: ');
  
  console.log('\n🔐 Configuración del webhook:');
  console.log('Este token se usará para verificar el webhook de Meta');
  const metaVerifyToken = await question('META_VERIFY_TOKEN (puede ser cualquier string seguro): ') || 'mi_token_secreto_123';

  console.log('\n🌐 Configuración del webhook:');
  console.log('Para desarrollo local, puedes usar ngrok: ngrok http 3000');
  const webhookUrl = await question('WEBHOOK_URL (ej: https://tu-dominio.com/webhook): ');

  console.log('\n📊 Configuración adicional:');
  const logLevel = await question('Nivel de logging (error/warn/info/debug) (default: info): ') || 'info';
  const jwtSecret = await question('JWT_SECRET (para autenticación, opcional): ') || 'mi_jwt_secreto_123';

  // Construir el contenido del archivo .env
  const newEnvContent = `# Configuración del servidor
PORT=${port}
NODE_ENV=${nodeEnv}

# Meta WhatsApp Business API Configuration
META_APP_ID=${metaAppId}
META_APP_SECRET=${metaAppSecret}
META_ACCESS_TOKEN=${metaAccessToken}
META_PHONE_NUMBER_ID=${metaPhoneNumberId}
META_VERIFY_TOKEN=${metaVerifyToken}

# Webhook Configuration
WEBHOOK_URL=${webhookUrl}

# Database Configuration (opcional para almacenar mensajes)
DATABASE_URL=mongodb://localhost:27017/whatsapp-service

# Logging
LOG_LEVEL=${logLevel}

# Security
JWT_SECRET=${jwtSecret}
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
`;

  // Escribir el archivo .env
  fs.writeFileSync(envPath, newEnvContent);

  console.log('\n✅ Archivo .env configurado exitosamente!');
  console.log('\n📋 Próximos pasos:');
  console.log('1. Verifica que todos los valores de Meta estén correctos');
  console.log('2. Si usas ngrok, ejecuta: ngrok http 3000');
  console.log('3. Configura el webhook en Meta Developer Console:');
  console.log(`   - URL: ${webhookUrl || 'https://tu-dominio.com/webhook'}`);
  console.log(`   - Verify Token: ${metaVerifyToken}`);
  console.log('4. Inicia el servidor: npm start');
  console.log('5. Prueba el servicio con: npm run test');

  rl.close();
}

// Ejecutar el setup
setupEnvironment().catch(console.error); 