require('dotenv').config();
const axios = require('axios');
const logger = require('./src/utils/logger');

async function testConfiguration() {
  console.log('🔍 Verificando configuración del servicio WhatsApp...\n');

  // Verificar variables de entorno
  const requiredEnvVars = [
    'META_APP_ID',
    'META_APP_SECRET', 
    'META_ACCESS_TOKEN',
    'META_PHONE_NUMBER_ID',
    'META_VERIFY_TOKEN'
  ];

  console.log('📋 Variables de entorno requeridas:');
  let allEnvVarsPresent = true;
  
  for (const envVar of requiredEnvVars) {
    const value = process.env[envVar];
    if (value) {
      console.log(`✅ ${envVar}: ${envVar.includes('SECRET') || envVar.includes('TOKEN') ? '***configurado***' : value}`);
    } else {
      console.log(`❌ ${envVar}: NO CONFIGURADO`);
      allEnvVarsPresent = false;
    }
  }

  if (!allEnvVarsPresent) {
    console.log('\n❌ Faltan variables de entorno requeridas. Ejecuta: node setup.js');
    return;
  }

  console.log('\n🔗 Probando conexión con Meta WhatsApp Business API...');

  try {
    // Probar conexión con la API de Meta
    const response = await axios.get(
      `https://graph.facebook.com/v18.0/${process.env.META_PHONE_NUMBER_ID}`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.META_ACCESS_TOKEN}`
        }
      }
    );

    console.log('✅ Conexión exitosa con Meta WhatsApp Business API');
    console.log('📱 Información del número de teléfono:');
    console.log(`   - ID: ${response.data.id}`);
    console.log(`   - Número: ${response.data.display_phone_number}`);
    console.log(`   - Estado: ${response.data.verified_name || 'No verificado'}`);

    // Probar obtención de plantillas
    console.log('\n📝 Probando obtención de plantillas...');
    const templatesResponse = await axios.get(
      `https://graph.facebook.com/v18.0/${process.env.META_PHONE_NUMBER_ID}/message_templates`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.META_ACCESS_TOKEN}`
        }
      }
    );

    console.log('✅ Plantillas obtenidas exitosamente');
    console.log(`   - Total de plantillas: ${templatesResponse.data.data?.length || 0}`);

    if (templatesResponse.data.data && templatesResponse.data.data.length > 0) {
      console.log('   - Plantillas disponibles:');
      templatesResponse.data.data.forEach((template, index) => {
        console.log(`     ${index + 1}. ${template.name} (${template.status})`);
      });
    }

    console.log('\n🎉 ¡Configuración verificada exitosamente!');
    console.log('\n📋 Próximos pasos:');
    console.log('1. Inicia el servidor: npm start');
    console.log('2. Para desarrollo local, ejecuta: ngrok http 3000');
    console.log('3. Configura el webhook en Meta Developer Console:');
    console.log(`   - URL: https://tu-dominio-ngrok.ngrok.io/webhook`);
    console.log(`   - Verify Token: ${process.env.META_VERIFY_TOKEN}`);
    console.log('4. Prueba enviar un mensaje con: curl -X POST http://localhost:3000/api/whatsapp/send/text \\');
    console.log('   -H "Content-Type: application/json" \\');
    console.log('   -d \'{"to": "34612345678", "text": "Hola desde el servicio!"}\'');

  } catch (error) {
    console.log('❌ Error conectando con Meta WhatsApp Business API:');
    
    if (error.response) {
      console.log(`   - Status: ${error.response.status}`);
      console.log(`   - Error: ${error.response.data?.error?.message || error.response.data?.error || 'Error desconocido'}`);
      
      if (error.response.status === 401) {
        console.log('\n💡 Posibles soluciones:');
        console.log('   - Verifica que el META_ACCESS_TOKEN sea válido');
        console.log('   - Asegúrate de que el token tenga los permisos necesarios');
        console.log('   - Verifica que el META_PHONE_NUMBER_ID sea correcto');
      } else if (error.response.status === 404) {
        console.log('\n💡 Posibles soluciones:');
        console.log('   - Verifica que el META_PHONE_NUMBER_ID sea correcto');
        console.log('   - Asegúrate de que el número de teléfono esté configurado en tu app');
      }
    } else {
      console.log(`   - Error: ${error.message}`);
    }
  }
}

// Ejecutar la prueba
testConfiguration().catch(console.error); 