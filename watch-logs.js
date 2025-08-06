const { spawn } = require('child_process');
const axios = require('axios');

console.log('🔍 Monitoreando logs del servicio WhatsApp...\n');

// Función para hacer ping al servidor y ver logs
async function checkServer() {
  try {
    const response = await axios.get('http://localhost:3000/health');
    console.log(`✅ Servidor funcionando: ${response.data.status}`);
  } catch (error) {
    console.log('❌ Servidor no responde');
  }
}

// Verificar cada 5 segundos
setInterval(checkServer, 5000);

// Mostrar instrucciones
console.log('📱 Para probar la recepción de mensajes:');
console.log('1. Envía un mensaje desde WhatsApp al número de tu WhatsApp Business');
console.log('2. Los logs aparecerán aquí automáticamente');
console.log('3. También puedes ver los logs en la terminal donde ejecutaste npm start\n');

console.log('🔄 Monitoreando... (Ctrl+C para salir)\n'); 