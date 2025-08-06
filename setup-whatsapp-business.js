require('dotenv').config();
const twilio = require('twilio');

async function setupWhatsAppBusiness() {
  console.log('🚀 Configuración de WhatsApp Business\n');
  
  try {
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    
    console.log('📋 Estado actual:');
    console.log(`   - Account SID: ${process.env.TWILIO_ACCOUNT_SID}`);
    console.log(`   - WhatsApp Number: ${process.env.TWILIO_WHATSAPP_NUMBER}`);
    console.log(`   - Messaging Service SID: ${process.env.TWILIO_MESSAGING_SERVICE_SID || 'No configurado'}\n`);
    
    // Verificar servicios existentes
    console.log('🔍 Verificando servicios de mensajería...');
    const services = await client.messaging.v1.services.list();
    
    if (services.length === 0) {
      console.log('   ❌ No hay servicios de mensajería configurados');
      console.log('\n📝 Pasos para configurar WhatsApp Business:');
      console.log('1. Ve a https://console.twilio.com/messaging/services');
      console.log('2. Haz clic en "Create Messaging Service"');
      console.log('3. Nombre: "AteneAI WhatsApp Business"');
      console.log('4. Tipo: "WhatsApp Business"');
      console.log('5. Sigue el proceso de verificación de Meta');
      console.log('6. Copia el SID del servicio creado');
      console.log('7. Agrégalo a tu archivo .env como TWILIO_MESSAGING_SERVICE_SID');
    } else {
      console.log(`   ✅ Encontrados ${services.length} servicios:`);
      for (const service of services) {
        console.log(`      - ${service.friendlyName} (${service.sid})`);
        console.log(`        Estado: ${service.status}`);
        console.log(`        Tipo: ${service.inboundRequestUrl ? 'Con webhook' : 'Sin webhook'}`);
      }
      
      // Verificar si hay un servicio de WhatsApp Business
      const whatsappService = services.find(s => s.friendlyName.toLowerCase().includes('whatsapp'));
      if (whatsappService) {
        console.log(`\n🎉 ¡WhatsApp Business encontrado!`);
        console.log(`   - SID: ${whatsappService.sid}`);
        console.log(`   - Nombre: ${whatsappService.friendlyName}`);
        console.log(`   - Estado: ${whatsappService.status}`);
        
        console.log('\n📝 Para completar la configuración:');
        console.log(`1. Agrega esta línea a tu archivo .env:`);
        console.log(`   TWILIO_MESSAGING_SERVICE_SID=${whatsappService.sid}`);
        console.log('2. Reinicia el servidor');
        console.log('3. Configura los webhooks en Twilio Console');
      }
    }
    
    console.log('\n🔗 Enlaces útiles:');
    console.log('- Twilio Console: https://console.twilio.com/');
    console.log('- Messaging Services: https://console.twilio.com/messaging/services');
    console.log('- WhatsApp Business Setup: https://www.twilio.com/docs/whatsapp/quickstart/node');
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

setupWhatsAppBusiness(); 