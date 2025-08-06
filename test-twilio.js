require('dotenv').config();
const twilio = require('twilio');

async function testTwilio() {
  console.log('🧪 Probando conexión con Twilio...\n');
  
  console.log('📋 Credenciales configuradas:');
  console.log(`Account SID: ${process.env.TWILIO_ACCOUNT_SID}`);
  console.log(`Auth Token: ${process.env.TWILIO_AUTH_TOKEN ? '***configurado***' : 'NO CONFIGURADO'}`);
  console.log(`WhatsApp Number: ${process.env.TWILIO_WHATSAPP_NUMBER}\n`);

  try {
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    
    console.log('🔗 Conectando con Twilio...');
    
    // Probar obteniendo información de la cuenta
    const account = await client.api.accounts(process.env.TWILIO_ACCOUNT_SID).fetch();
    
    console.log('✅ Conexión exitosa!');
    console.log(`📊 Cuenta: ${account.friendlyName}`);
    console.log(`📈 Estado: ${account.status}`);
    console.log(`💰 Tipo: ${account.type}\n`);
    
    console.log('🎉 ¡Twilio está configurado correctamente!');
    console.log('\n📱 Próximos pasos:');
    console.log('1. Inicia el servidor: npm start');
    console.log('2. Prueba enviar un mensaje desde el dashboard');
    console.log('3. Para recibir mensajes, configura el webhook en Twilio');
    
  } catch (error) {
    console.log('❌ Error conectando con Twilio:');
    console.log(`   - Mensaje: ${error.message}`);
    console.log(`   - Código: ${error.code || 'N/A'}`);
    
    if (error.code === 20003) {
      console.log('\n💡 Posible solución:');
      console.log('   - Verifica que tu cuenta de Twilio esté activa');
      console.log('   - Asegúrate de que las credenciales sean correctas');
      console.log('   - Verifica que no estés en modo de prueba restringido');
    }
  }
}

testTwilio(); 