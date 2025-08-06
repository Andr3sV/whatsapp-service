require('dotenv').config();
const twilio = require('twilio');

async function getTwilioNumber() {
  try {
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    
    console.log('🔍 Obteniendo información de la cuenta de Twilio...\n');
    
    // Obtener información de la cuenta
    const account = await client.api.accounts(process.env.TWILIO_ACCOUNT_SID).fetch();
    console.log(`✅ Cuenta: ${account.friendlyName}`);
    console.log(`📊 Estado: ${account.status}\n`);
    
    // Obtener números de WhatsApp
    console.log('📱 Números de WhatsApp disponibles:');
    console.log('Para obtener tu número de WhatsApp:');
    console.log('1. Ve a https://console.twilio.com/');
    console.log('2. Navega a Messaging > Try it out > Send a WhatsApp message');
    console.log('3. Copia el número que aparece (ej: +14155238886)');
    console.log('4. Agrégalo a tu archivo .env como TWILIO_WHATSAPP_NUMBER\n');
    
    // Intentar obtener números de WhatsApp (puede que no tengas ninguno aún)
    try {
      const incomingPhoneNumbers = await client.incomingPhoneNumbers.list();
      const whatsappNumbers = incomingPhoneNumbers.filter(num => 
        num.capabilities && num.capabilities.whatsapp
      );
      
      if (whatsappNumbers.length > 0) {
        console.log('📞 Números con capacidad WhatsApp:');
        whatsappNumbers.forEach(num => {
          console.log(`   - ${num.phoneNumber} (${num.friendlyName})`);
        });
      } else {
        console.log('❌ No tienes números con capacidad WhatsApp configurados');
        console.log('💡 Necesitas activar WhatsApp en un número de Twilio');
      }
    } catch (error) {
      console.log('❌ Error obteniendo números:', error.message);
    }
    
  } catch (error) {
    console.log('❌ Error conectando con Twilio:', error.message);
    console.log('💡 Verifica que tu Account SID y Auth Token sean correctos');
  }
}

getTwilioNumber(); 