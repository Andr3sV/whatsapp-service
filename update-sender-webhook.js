require('dotenv').config();
const twilio = require('twilio');

async function updateSenderWebhook() {
  console.log('🔧 Actualizando webhook del Sender...\n');
  
  try {
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    
    // Usar la API correcta según la documentación
    console.log('📋 Obteniendo lista de Senders...');
    const senders = await client.messaging.v2.channels.senders.list();
    
    if (senders.length === 0) {
      console.log('❌ No se encontraron Senders configurados');
      return;
    }
    
    console.log(`✅ Encontrados ${senders.length} Senders:`);
    for (const sender of senders) {
      console.log(`   - ${sender.senderId} (${sender.sid}) - Estado: ${sender.status}`);
    }
    
    // Buscar el sender de WhatsApp
    const whatsappSender = senders.find(s => s.senderId.includes('whatsapp:'));
    
    if (!whatsappSender) {
      console.log('❌ No se encontró un Sender de WhatsApp');
      return;
    }
    
    console.log(`\n🎯 Actualizando webhook para: ${whatsappSender.senderId}`);
    
    // Actualizar el webhook del sender
    const updatedSender = await client.messaging.v2.channels.senders(whatsappSender.sid)
      .update({
        webhook: {
          callback_method: 'POST',
          callback_url: 'https://d0971033c774.ngrok-free.app/webhook'
        }
      });
    
    console.log('✅ Webhook actualizado exitosamente!');
    console.log(`   - Sender: ${updatedSender.senderId}`);
    console.log(`   - Estado: ${updatedSender.status}`);
    console.log(`   - Webhook: ${updatedSender.webhook.callback_url}`);
    
  } catch (error) {
    console.log('❌ Error:', error.message);
    if (error.code === 20003) {
      console.log('💡 Posible solución: Verifica que las credenciales sean correctas');
    }
  }
}

updateSenderWebhook(); 