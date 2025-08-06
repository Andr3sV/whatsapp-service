require('dotenv').config();
const twilio = require('twilio');

async function getWhatsAppBusinessNumbers() {
  console.log('🔍 Verificando números de WhatsApp Business disponibles...\n');
  
  try {
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    
    // Verificar números disponibles
    console.log('📱 Números de WhatsApp Business disponibles:');
    try {
      const phoneNumbers = await client.messaging.v1.services.list();
      console.log(`   - Servicios de mensajería encontrados: ${phoneNumbers.length}`);
      
      for (const service of phoneNumbers) {
        console.log(`   - Servicio: ${service.friendlyName} (${service.sid})`);
        console.log(`     Estado: ${service.status}`);
        console.log(`     Tipo: ${service.inboundRequestUrl ? 'Con webhook' : 'Sin webhook'}`);
      }
      
      if (phoneNumbers.length === 0) {
        console.log('   - No hay servicios de mensajería configurados');
        console.log('   - Necesitas crear un Messaging Service');
      }
      
    } catch (error) {
      console.log('   - Error obteniendo servicios:', error.message);
    }
    
    // Verificar números de teléfono
    console.log('\n📞 Números de teléfono disponibles:');
    try {
      const incomingPhoneNumbers = await client.incomingPhoneNumbers.list();
      console.log(`   - Números totales: ${incomingPhoneNumbers.length}`);
      
      for (const number of incomingPhoneNumbers) {
        console.log(`   - ${number.phoneNumber} (${number.friendlyName})`);
        console.log(`     Estado: ${number.status}`);
        console.log(`     Capacidades: ${number.capabilities.join(', ')}`);
      }
      
    } catch (error) {
      console.log('   - Error obteniendo números:', error.message);
    }
    
    console.log('\n💡 Pasos para WhatsApp Business:');
    console.log('1. Ve a Twilio Console → Messaging → Services');
    console.log('2. Crea un nuevo Messaging Service');
    console.log('3. Configura WhatsApp Business en el servicio');
    console.log('4. Solicita aprobación de Meta');
    console.log('5. Configura webhooks de producción');
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

getWhatsAppBusinessNumbers(); 