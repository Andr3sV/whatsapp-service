require('dotenv').config();

function testWorkspaceWebhooks() {
  console.log('🔍 Probando webhooks por workspace...\n');

  // Simular la lógica del webhookRouter
  function getWorkspaceForNumber(phoneNumber) {
    const cleanNumber = phoneNumber.replace('whatsapp:', '');
    
    const enabledWorkspaces = process.env.WHATSAPP_ENABLED_WORKSPACES;
    if (enabledWorkspaces) {
      const workspaces = enabledWorkspaces.split(',').map(w => w.trim());
      
      for (const workspaceId of workspaces) {
        const workspaceNumber = process.env[`TWILIO_WHATSAPP_NUMBER__${workspaceId}`] || 
                               process.env[`TWILIO_WHATSAPP_NUMBER_${workspaceId}`];
        
        if (workspaceNumber === cleanNumber) {
          return {
            workspace_id: workspaceId,
            workspace_name: process.env[`WHATSAPP_WORKSPACE_NAME__${workspaceId}`] || `Workspace ${workspaceId}`
          };
        }
      }
    }
    
    return {
      workspace_id: '1',
      workspace_name: 'Default'
    };
  }

  function getWebhookForWorkspace(workspaceId) {
    const webhookUrl = process.env[`N8N_WEBHOOK_WORKSPACE_${workspaceId}_URL`];
    const webhookName = process.env[`N8N_WEBHOOK_WORKSPACE_${workspaceId}_NAME`] || `Workspace ${workspaceId}`;
    const enabled = process.env[`N8N_WEBHOOK_WORKSPACE_${workspaceId}_ENABLED`] !== 'false';

    if (webhookUrl && enabled) {
      return {
        url: webhookUrl,
        name: webhookName,
        enabled: true
      };
    }

    // Si no hay webhook específico, usar el por defecto
    const defaultWebhook = process.env.N8N_DEFAULT_WEBHOOK_URL;
    if (defaultWebhook) {
      return {
        url: defaultWebhook,
        name: 'default',
        enabled: true
      };
    }

    return null;
  }

  // Números de prueba
  const testNumbers = [
    '+34603960818',
    '+971543381600',
    '+1234567890',
    '+9999999999' // Número no configurado
  ];

  console.log('📱 Probando routing de números:');
  for (const number of testNumbers) {
    const workspace = getWorkspaceForNumber(number);
    const webhook = getWebhookForWorkspace(workspace.workspace_id);
    
    console.log(`   ${number} → Workspace ${workspace.workspace_id}: ${workspace.workspace_name}`);
    console.log(`      Webhook: ${webhook ? webhook.name : 'NO CONFIGURADO'} (${webhook ? webhook.url : 'N/A'})`);
  }

  console.log('\n📋 Payload que se enviaría a n8n:');
  const sampleMessage = {
    from: '+34631021622',
    body: 'Hola, necesito ayuda',
    type: 'text',
    messageId: 'SM1234567890',
    timestamp: new Date().toISOString()
  };

  for (const number of testNumbers) {
    const workspace = getWorkspaceForNumber(number);
    const webhook = getWebhookForWorkspace(workspace.workspace_id);
    
    if (webhook) {
      const payload = {
        phoneNumber: number,
        message: sampleMessage,
        timestamp: new Date().toISOString(),
        webhookName: webhook.name,
        source: 'whatsapp-service',
        workspace: workspace
      };
      
      console.log(`\n   📤 Para ${number}:`);
      console.log(`   Workspace: ${workspace.workspace_id} (${workspace.workspace_name})`);
      console.log(`   Webhook: ${webhook.name}`);
      console.log(`   URL: ${webhook.url}`);
      console.log(`   Payload: ${JSON.stringify(payload, null, 2)}`);
    } else {
      console.log(`\n   ❌ Para ${number}: NO HAY WEBHOOK CONFIGURADO`);
    }
  }

  console.log('\n💡 Configuración recomendada para n8n:');
  console.log('1. Crear 3 webhooks separados:');
  console.log('   - /webhook/workspace1 → Workflow Cliente 1');
  console.log('   - /webhook/workspace2 → Workflow Cliente 2');
  console.log('   - /webhook/workspace3 → Workflow Cliente 3');
  console.log('\n2. Cada workflow procesa solo su workspace');
  console.log('3. NO hay colas entre workspaces diferentes');
  console.log('4. Cada workflow puede tardar 40+ segundos sin afectar a otros');
}

// Ejecutar la prueba
testWorkspaceWebhooks();
