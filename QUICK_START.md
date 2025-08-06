# 🚀 Guía de Inicio Rápido - WhatsApp Service

## ⚡ Configuración en 5 minutos

### 1. Configuración Automática

```bash
npm run setup
```

Sigue las instrucciones para configurar tus credenciales de Meta.

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Iniciar el Servidor

```bash
npm run dev
```

El servicio estará disponible en `http://localhost:3000`

## 🔧 Configuración Manual (si no usas el setup automático)

### 1. Crear archivo .env

```bash
cp env.example .env
```

### 2. Editar .env con tus credenciales

```env
META_APP_ID=tu_app_id
META_APP_SECRET=tu_app_secret
META_ACCESS_TOKEN=tu_access_token
META_PHONE_NUMBER_ID=tu_phone_number_id
META_VERIFY_TOKEN=tu_verify_token
```

## 📱 Prueba Rápida

### Enviar un mensaje de texto:

```bash
curl -X POST http://localhost:3000/api/whatsapp/send/text \
  -H "Content-Type: application/json" \
  -d '{
    "to": "34612345678",
    "text": "¡Hola desde el servicio!"
  }'
```

### Verificar estado del servicio:

```bash
curl http://localhost:3000/health
```

## 🌐 Configuración de Webhook para Desarrollo

### Usando ngrok:

```bash
# Instalar ngrok
npm install -g ngrok

# Exponer el puerto local
ngrok http 3000

# Usar la URL de ngrok en Meta for Developers
# Ejemplo: https://abc123.ngrok.io/webhook
```

## 📋 Checklist de Configuración

- [ ] Crear aplicación en Meta for Developers
- [ ] Configurar WhatsApp Business API
- [ ] Obtener credenciales (App ID, Secret, Access Token, Phone Number ID)
- [ ] Configurar webhook en Meta
- [ ] Ejecutar `npm run setup` o configurar .env manualmente
- [ ] Instalar dependencias con `npm install`
- [ ] Iniciar servidor con `npm run dev`
- [ ] Probar envío de mensaje
- [ ] Verificar recepción de webhooks

## 🆘 Solución de Problemas Comunes

### Error: "Configuración de Meta incompleta"

- Verifica que todas las variables de entorno estén configuradas
- Asegúrate de que el Access Token sea válido

### Error: "Webhook no verificado"

- Verifica que el META_VERIFY_TOKEN coincida con el configurado en Meta
- Asegúrate de que la URL del webhook sea accesible públicamente

### Error: "Rate limit exceeded"

- El servicio tiene un límite de requests por IP
- Ajusta RATE_LIMIT_MAX_REQUESTS en .env si es necesario

## 📚 Próximos Pasos

1. Revisa el [README.md](README.md) completo para más detalles
2. Importa la colección de [Postman](postman_collection.json) para probar todos los endpoints
3. Configura respuestas automáticas en el webhook
4. Implementa lógica de negocio personalizada

## 🔗 Enlaces Útiles

- [Meta for Developers](https://developers.facebook.com/)
- [WhatsApp Business API Docs](https://developers.facebook.com/docs/whatsapp)
- [ngrok](https://ngrok.com/) - Para desarrollo local

---

**¡Listo para usar! 🎉**
