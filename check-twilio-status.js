require('dotenv').config();
const twilio = require('twilio');

async function checkTwilioStatus() {
  console.log('🔍 Verificando estado de Twilio...\n');
  
  try {
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    
    // Verificar cuenta
    console.log('📊 Información de la cuenta:');
    const account = await client.api.accounts(process.env.TWILIO_ACCOUNT_SID).fetch();
    console.log(`   - Nombre: ${account.friendlyName}`);
    console.log(`   - Estado: ${account.status}`);
    console.log(`   - Tipo: ${account.type}`);
    console.log(`   - Fecha de creación: ${account.dateCreated}`);
    
    // Verificar números de WhatsApp
    console.log('\n📱 Números de WhatsApp:');
    try {
      const incomingPhoneNumbers = await client.incomingPhoneNumbers.list();
      const whatsappNumbers = incomingPhoneNumbers.filter(num => 
        num.phoneNumber === process.env.TWILIO_WHATSAPP_NUMBER
      );
      
      if (whatsappNumbers.length > 0) {
        console.log(`   - Número: ${whatsappNumbers[0].phoneNumber}`);
        console.log(`   - Nombre: ${whatsappNumbers[0].friendlyName}`);
        console.log(`   - Estado: ${whatsappNumbers[0].status}`);
      } else {
        console.log('   - No se encontró el número de WhatsApp configurado');
      }
    } catch (error) {
      console.log('   - Error obteniendo números:', error.message);
    }
    
    // Verificar si está en sandbox
    console.log('\n🔧 Estado del WhatsApp Sandbox:');
    if (account.status === 'active') {
      console.log('   ✅ Cuenta activa');
      console.log('   ℹ️  Para recibir mensajes entrantes necesitas:');
      console.log('      - Un número de WhatsApp Business verificado');
      console.log('      - Salir del modo sandbox');
      console.log('      - Configurar webhooks en producción');
    } else {
      console.log('   ⚠️  Cuenta no activa');
    }
    
    console.log('\n💡 Recomendaciones:');
    console.log('1. Para recibir mensajes entrantes, necesitas un número de WhatsApp Business');
    console.log('2. El sandbox solo permite enviar mensajes, no recibir');
    console.log('3. Contacta a Twilio para activar WhatsApp Business');
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

checkTwilioStatus(); 