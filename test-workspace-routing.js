require('dotenv').config();

function testWorkspaceRouting() {
  console.log('🔍 Probando routing de workspaces...\n');

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
    console.log(`   ${number} → Workspace ${workspace.workspace_id}: ${workspace.workspace_name}`);
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
    const payload = {
      phoneNumber: number,
      message: sampleMessage,
      timestamp: new Date().toISOString(),
      webhookName: 'ateneai',
      source: 'whatsapp-service',
      workspace: workspace
    };
    
    console.log(`\n   📤 Para ${number}:`);
    console.log(`   Workspace: ${workspace.workspace_id} (${workspace.workspace_name})`);
    console.log(`   Payload: ${JSON.stringify(payload, null, 2)}`);
  }

  console.log('\n💡 Cómo usar en n8n:');
  console.log('1. Recibe todos los mensajes en un solo webhook');
  console.log('2. Filtra por workspace.workspace_id');
  console.log('3. Ejecuta el workflow correspondiente');
  console.log('\n   Ejemplo de filtro en n8n:');
  console.log('   - Si workspace.workspace_id === "1" → Workflow Cliente 1');
  console.log('   - Si workspace.workspace_id === "2" → Workflow Cliente 2');
  console.log('   - Si workspace.workspace_id === "3" → Workflow Cliente 3');
}

// Ejecutar la prueba
testWorkspaceRouting();
