require('dotenv').config();

function testWorkspaceConfiguration() {
  console.log('🔍 Verificando configuración de workspaces...\n');

  // Verificar variables básicas
  console.log('📋 Variables básicas:');
  console.log(`   - TWILIO_ACCOUNT_SID: ${process.env.TWILIO_ACCOUNT_SID ? '✅ Configurado' : '❌ NO CONFIGURADO'}`);
  console.log(`   - TWILIO_AUTH_TOKEN: ${process.env.TWILIO_AUTH_TOKEN ? '✅ Configurado' : '❌ NO CONFIGURADO'}`);
  console.log(`   - TWILIO_WHATSAPP_NUMBER: ${process.env.TWILIO_WHATSAPP_NUMBER || '❌ NO CONFIGURADO'}`);
  console.log(`   - TWILIO_MESSAGING_SERVICE_SID: ${process.env.TWILIO_MESSAGING_SERVICE_SID || '❌ NO CONFIGURADO'}\n`);

  // Verificar sistema de workspaces
  console.log('🏢 Sistema de Workspaces:');
  const enabledWorkspaces = process.env.WHATSAPP_ENABLED_WORKSPACES;
  if (enabledWorkspaces) {
    const workspaces = enabledWorkspaces.split(',').map(w => w.trim());
    console.log(`   - Workspaces habilitados: ${workspaces.join(', ')}`);
    
    for (const workspaceId of workspaces) {
      console.log(`\n   📱 Workspace ${workspaceId}:`);
      
      const messagingServiceSid = process.env[`TWILIO_MESSAGING_SERVICE_SID__${workspaceId}`] || 
                                  process.env[`TWILIO_MESSAGING_SERVICE_SID_${workspaceId}`];
      const whatsappNumber = process.env[`TWILIO_WHATSAPP_NUMBER__${workspaceId}`] || 
                            process.env[`TWILIO_WHATSAPP_NUMBER_${workspaceId}`];
      const workspaceName = process.env[`WHATSAPP_WORKSPACE_NAME__${workspaceId}`];
      
      console.log(`     - Messaging Service SID: ${messagingServiceSid || '❌ NO CONFIGURADO'}`);
      console.log(`     - Número WhatsApp: ${whatsappNumber || '❌ NO CONFIGURADO'}`);
      console.log(`     - Nombre: ${workspaceName || '❌ NO CONFIGURADO'}`);
    }
  } else {
    console.log('   ❌ WHATSAPP_ENABLED_WORKSPACES no configurado');
  }

  // Verificar token de servicio
  console.log(`\n🔐 Token de servicio: ${process.env.WHATSAPP_SERVICE_TOKEN ? '✅ Configurado' : '❌ NO CONFIGURADO'}`);

  // Verificar webhooks
  console.log('\n📡 Configuración de Webhooks:');
  const defaultWebhook = process.env.N8N_DEFAULT_WEBHOOK_URL;
  console.log(`   - Webhook por defecto: ${defaultWebhook || '❌ NO CONFIGURADO'}`);

  // Buscar webhooks específicos por número
  Object.keys(process.env).forEach(key => {
    if (key.startsWith('N8N_WEBHOOK_') && key.endsWith('_URL')) {
      const number = key.replace('N8N_WEBHOOK_', '').replace('_URL', '');
      const webhookUrl = process.env[key];
      const webhookName = process.env[`N8N_WEBHOOK_${number}_NAME`] || number;
      const enabled = process.env[`N8N_WEBHOOK_${number}_ENABLED`] !== 'false';
      
      console.log(`   - ${number}: ${webhookName} (${enabled ? '✅ Activo' : '❌ Inactivo'})`);
      console.log(`     URL: ${webhookUrl}`);
    }
  });

  console.log('\n💡 Recomendaciones:');
  console.log('1. Asegúrate de que cada workspace tenga su número específico configurado');
  console.log('2. Verifica que los webhooks estén configurados para cada número');
  console.log('3. Reinicia el servicio después de cambiar la configuración');
}

// Ejecutar la prueba
testWorkspaceConfiguration();
