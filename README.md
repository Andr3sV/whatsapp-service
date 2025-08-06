# WhatsApp Business API Service

Un servicio completo para recibir y enviar mensajes de WhatsApp usando la API de Meta WhatsApp Business.

## 🚀 Características

- ✅ Envío de mensajes de texto
- ✅ Envío de mensajes con botones interactivos
- ✅ Envío de mensajes con listas de opciones
- ✅ Envío de imágenes con captions
- ✅ Envío de documentos
- ✅ Envío de ubicaciones
- ✅ Envío de plantillas de mensajes
- ✅ Procesamiento de webhooks entrantes
- ✅ Respuestas automáticas
- ✅ Validación de datos con Joi
- ✅ Logging completo con Winston
- ✅ Manejo de errores robusto
- ✅ Rate limiting
- ✅ Seguridad con Helmet

## 📋 Prerrequisitos

- Node.js 16.0.0 o superior
- Cuenta de Meta for Developers
- Número de teléfono de WhatsApp Business
- Dominio público con HTTPS (para webhooks)

## 🛠️ Instalación

1. **Clonar el repositorio:**

```bash
git clone <tu-repositorio>
cd whatsapp-service
```

2. **Instalar dependencias:**

```bash
npm install
```

3. **Configurar variables de entorno:**

```bash
cp env.example .env
```

4. **Editar el archivo .env con tus credenciales de Meta**

## 🔧 Configuración en Meta for Developers

### Paso 1: Crear una aplicación en Meta for Developers

1. Ve a [Meta for Developers](https://developers.facebook.com/)
2. Crea una nueva aplicación o usa una existente
3. Selecciona "Business" como tipo de aplicación

### Paso 2: Configurar WhatsApp Business API

1. En el dashboard de tu aplicación, ve a "Add Product"
2. Busca y agrega "WhatsApp"
3. Configura tu número de teléfono de WhatsApp Business

### Paso 3: Obtener credenciales

1. **App ID y App Secret:**

   - Ve a "Settings" > "Basic"
   - Copia el App ID y App Secret

2. **Access Token:**

   - Ve a "WhatsApp" > "Getting Started"
   - Genera un token de acceso temporal o permanente

3. **Phone Number ID:**
   - Ve a "WhatsApp" > "Phone Numbers"
   - Copia el ID del número de teléfono

### Paso 4: Configurar Webhook

1. En "WhatsApp" > "Configuration"
2. Configura la URL del webhook: `https://tu-dominio.com/webhook`
3. Configura el Verify Token (debe coincidir con META_VERIFY_TOKEN en .env)
4. Selecciona los campos a suscribir:
   - `messages`
   - `message_deliveries`
   - `message_reads`

## ⚙️ Configuración de Variables de Entorno

Edita el archivo `.env` con tus credenciales:

```env
# Configuración del servidor
PORT=3000
NODE_ENV=development

# Meta WhatsApp Business API Configuration
META_APP_ID=tu_app_id_aqui
META_APP_SECRET=tu_app_secret_aqui
META_ACCESS_TOKEN=tu_access_token_aqui
META_PHONE_NUMBER_ID=tu_phone_number_id_aqui
META_VERIFY_TOKEN=tu_verify_token_personalizado_aqui

# Webhook Configuration
WEBHOOK_URL=https://tu-dominio.com/webhook

# Logging
LOG_LEVEL=info

# Security
JWT_SECRET=tu_jwt_secret_aqui
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 🚀 Ejecutar el Servicio

### Desarrollo:

```bash
npm run dev
```

### Producción:

```bash
npm start
```

El servicio estará disponible en `http://localhost:3000`

## 📡 Endpoints de la API

### Envío de Mensajes

#### 1. Mensaje de Texto

```http
POST /api/whatsapp/send/text
Content-Type: application/json

{
  "to": "34612345678",
  "text": "¡Hola! ¿Cómo estás?"
}
```

#### 2. Mensaje con Botones

```http
POST /api/whatsapp/send/button
Content-Type: application/json

{
  "to": "34612345678",
  "text": "¿Te gustaría recibir más información?",
  "buttons": [
    {"title": "Sí, por favor"},
    {"title": "No, gracias"}
  ]
}
```

#### 3. Mensaje con Lista

```http
POST /api/whatsapp/send/list
Content-Type: application/json

{
  "to": "34612345678",
  "text": "Selecciona una opción:",
  "sections": [
    {
      "title": "Servicios",
      "rows": [
        {
          "id": "servicio_1",
          "title": "Consultoría",
          "description": "Servicios de consultoría empresarial"
        },
        {
          "id": "servicio_2",
          "title": "Desarrollo",
          "description": "Desarrollo de software a medida"
        }
      ]
    }
  ]
}
```

#### 4. Imagen

```http
POST /api/whatsapp/send/image
Content-Type: application/json

{
  "to": "34612345678",
  "imageUrl": "https://ejemplo.com/imagen.jpg",
  "caption": "Esta es una imagen de ejemplo"
}
```

#### 5. Documento

```http
POST /api/whatsapp/send/document
Content-Type: application/json

{
  "to": "34612345678",
  "documentUrl": "https://ejemplo.com/documento.pdf",
  "filename": "documento.pdf",
  "caption": "Aquí tienes el documento solicitado"
}
```

#### 6. Ubicación

```http
POST /api/whatsapp/send/location
Content-Type: application/json

{
  "to": "34612345678",
  "latitude": 40.4168,
  "longitude": -3.7038,
  "name": "Oficina Principal",
  "address": "Calle Mayor, 123, Madrid"
}
```

#### 7. Plantilla

```http
POST /api/whatsapp/send/template
Content-Type: application/json

{
  "to": "34612345678",
  "templateName": "hello_world",
  "language": "es"
}
```

### Gestión de Mensajes

#### Marcar como Leído

```http
POST /api/whatsapp/messages/{messageId}/read
```

### Información del Servicio

#### Estado del Servicio

```http
GET /api/whatsapp/status
```

#### Información del Número

```http
GET /api/whatsapp/phone-info
```

#### Plantillas Disponibles

```http
GET /api/whatsapp/templates
```

### Webhook

#### Procesar Mensajes Entrantes

```http
POST /api/whatsapp/webhook
```

## 🔄 Webhook de Meta

El servicio procesa automáticamente los webhooks de Meta y puede:

- Recibir mensajes entrantes
- Enviar respuestas automáticas
- Marcar mensajes como leídos
- Procesar diferentes tipos de contenido

### Configuración del Webhook en Meta:

1. URL: `https://tu-dominio.com/webhook`
2. Verify Token: El mismo que configuraste en META_VERIFY_TOKEN
3. Campos a suscribir:
   - `messages`
   - `message_deliveries`
   - `message_reads`

## 📝 Ejemplos de Uso

### Ejemplo con cURL

```bash
# Enviar mensaje de texto
curl -X POST http://localhost:3000/api/whatsapp/send/text \
  -H "Content-Type: application/json" \
  -d '{
    "to": "34612345678",
    "text": "¡Hola desde el servicio de WhatsApp!"
  }'

# Enviar mensaje con botones
curl -X POST http://localhost:3000/api/whatsapp/send/button \
  -H "Content-Type: application/json" \
  -d '{
    "to": "34612345678",
    "text": "¿Te gustaría recibir más información?",
    "buttons": [
      {"title": "Sí, por favor"},
      {"title": "No, gracias"}
    ]
  }'
```

### Ejemplo con JavaScript

```javascript
// Enviar mensaje de texto
const response = await fetch("http://localhost:3000/api/whatsapp/send/text", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    to: "34612345678",
    text: "¡Hola desde JavaScript!",
  }),
});

const result = await response.json();
console.log(result);
```

## 🔒 Seguridad

El servicio incluye varias medidas de seguridad:

- **Helmet**: Headers de seguridad HTTP
- **Rate Limiting**: Límite de requests por IP
- **CORS**: Configuración de Cross-Origin Resource Sharing
- **Validación**: Validación de datos con Joi
- **Logging**: Logs de seguridad y auditoría

## 📊 Logging

El servicio utiliza Winston para logging con:

- Logs de consola en desarrollo
- Logs de archivo en producción
- Rotación automática de logs
- Diferentes niveles de logging

Los logs se guardan en el directorio `logs/`:

- `combined.log`: Todos los logs
- `error.log`: Solo errores

## 🐛 Troubleshooting

### Error: "Configuración de Meta incompleta"

- Verifica que todas las variables de entorno de Meta estén configuradas
- Asegúrate de que el Access Token sea válido

### Error: "Webhook no verificado"

- Verifica que el META_VERIFY_TOKEN coincida con el configurado en Meta
- Asegúrate de que la URL del webhook sea accesible públicamente

### Error: "Rate limit exceeded"

- El servicio tiene un límite de requests por IP
- Ajusta RATE_LIMIT_MAX_REQUESTS en .env si es necesario

## 📚 Recursos Adicionales

- [Meta WhatsApp Business API Documentation](https://developers.facebook.com/docs/whatsapp)
- [Meta for Developers](https://developers.facebook.com/)
- [WhatsApp Business Platform](https://business.whatsapp.com/)

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 🆘 Soporte

Si tienes problemas o preguntas:

1. Revisa la documentación de Meta WhatsApp Business API
2. Verifica los logs del servicio
3. Asegúrate de que todas las configuraciones sean correctas
4. Contacta al equipo de desarrollo

---

**¡Disfruta usando el servicio de WhatsApp Business API! 🚀**
