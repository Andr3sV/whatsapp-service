# WhatsApp Service API Documentation

## Integración con n8n - Sistema Escalable

### Arquitectura

```
WhatsApp → Twilio → WhatsApp Service → n8n → Frontend (app.ateneai.com)
```

### Configuración de Webhooks

#### Variables de Entorno

```bash
# Webhook por defecto
N8N_DEFAULT_WEBHOOK_URL=https://your-n8n-instance.com/webhook/default

# Webhooks específicos por número
N8N_WEBHOOK_+34603960818_URL=https://your-n8n-instance.com/webhook/cliente1
N8N_WEBHOOK_+34603960818_NAME=Cliente 1
N8N_WEBHOOK_+34603960818_ENABLED=true
```

### Endpoints de la API

#### 1. Gestión de Webhooks

##### Obtener configuraciones de webhook
```http
GET /api/whatsapp/webhooks
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "+34603960818": {
      "url": "https://your-n8n-instance.com/webhook/default...",
      "name": "default",
      "enabled": true
    }
  }
}
```

##### Añadir configuración de webhook
```http
POST /api/whatsapp/webhooks
Content-Type: application/json

{
  "phoneNumber": "+34603960818",
  "webhookUrl": "https://your-n8n-instance.com/webhook/cliente1",
  "name": "Cliente 1"
}
```

##### Actualizar configuración de webhook
```http
PUT /api/whatsapp/webhooks/+34603960818
Content-Type: application/json

{
  "enabled": false,
  "name": "Cliente 1 - Deshabilitado"
}
```

##### Eliminar configuración de webhook
```http
DELETE /api/whatsapp/webhooks/+34603960818
```

#### 2. Envío de Mensajes

##### Enviar mensaje de texto
```http
POST /api/whatsapp/send/text
Content-Type: application/json

{
  "to": "+34631021622",
  "text": "Hola desde n8n!"
}
```

#### 3. Estado del Servicio

##### Obtener estado completo
```http
GET /api/whatsapp/status
```

**Respuesta incluye:**
```json
{
  "success": true,
  "data": {
    "status": "online",
    "whatsappNumber": "+34603960818",
    "environment": "WhatsApp Business",
    "n8nWebhooks": {
      "+34603960818": {
        "url": "https://your-n8n-instance.com/webhook/default...",
        "name": "default",
        "enabled": true
      }
    }
  }
}
```

### Formato de Datos para n8n

Cuando llega un mensaje, se envía a n8n con este formato:

```json
{
  "phoneNumber": "+34631021622",
  "message": {
    "from": "+34631021622",
    "to": "+34603960818",
    "body": "Hola, necesito ayuda",
    "type": "text",
    "messageId": "SM1234567890",
    "timestamp": "2025-08-06T16:30:00.000Z"
  },
  "timestamp": "2025-08-06T16:30:00.000Z",
  "webhookName": "default",
  "source": "whatsapp-service"
}
```

### Configuración en n8n

#### 1. Crear Webhook Node
- **URL:** `https://your-n8n-instance.com/webhook/cliente1`
- **Method:** POST
- **Response Mode:** Respond to Webhook

#### 2. Procesar Datos
```javascript
// En n8n, acceder a los datos:
const phoneNumber = $json.phoneNumber;
const message = $json.message.body;
const from = $json.message.from;
```

#### 3. Respuesta a WhatsApp
```javascript
// Para responder desde n8n:
const response = {
  to: $json.phoneNumber,
  text: "Gracias por tu mensaje, te responderemos pronto."
};

// Hacer POST a tu API
await $http.post('https://webhook.ateneai.com/api/whatsapp/send/text', response);
```

### Escalabilidad

#### Añadir Nuevo Cliente

1. **Añadir número en Twilio:**
   - Crear nuevo WhatsApp Sender
   - Añadir al Messaging Service

2. **Configurar webhook específico:**
```bash
N8N_WEBHOOK_+34612345678_URL=https://your-n8n-instance.com/webhook/cliente2
N8N_WEBHOOK_+34612345678_NAME=Cliente 2
N8N_WEBHOOK_+34612345678_ENABLED=true
```

3. **Crear flujo en n8n:**
   - Nuevo webhook para el cliente
   - Lógica específica del chatbot
   - Integración con sistemas del cliente

### Monitoreo

#### Logs en Easypanel
- **Webhook recibido:** `🔔 WEBHOOK RECIBIDO`
- **Enviado a n8n:** `📤 Enviando a n8n`
- **Respuesta de n8n:** `✅ n8n respondió`

#### Endpoint de Estado
```http
GET /api/whatsapp/status
```
Incluye información de todos los webhooks configurados.

### Seguridad

- **Validación de números:** Solo números válidos
- **Rate limiting:** Protección contra spam
- **Logs seguros:** URLs ocultas en logs
- **SSL:** Todas las comunicaciones cifradas

### Próximos Pasos

1. **Frontend:** Dashboard en `app.ateneai.com`
2. **Chatbot:** Lógica en n8n
3. **Integración:** APIs de clientes
4. **Analytics:** Métricas de uso 