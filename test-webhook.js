// Test script para verificar la lógica del webhook
const testWebhookData = {
  "SmsMessageSid": "SM98382c43aedeffa8fc195d694e36e484",
  "NumMedia": "0",
  "ProfileName": "Andres Villamizar",
  "MessageType": "text",
  "SmsSid": "SM98382c43aedeffa8fc195d694e36e484",
  "WaId": "34631021622",
  "SmsStatus": "received",
  "Body": "Responde sin decir ok",
  "To": "whatsapp:+34603960818",
  "MessagingServiceSid": "MG972e6fe335dae13e4f62e404cddccfef",
  "NumSegments": "1",
  "ReferralNumMedia": "0",
  "MessageSid": "SM98382c43aedeffa8fc195d694e36e484",
  "AccountSid": "AC0a1ea4a16c636b103a573164052f1f14",
  "ChannelMetadata": "{\"type\":\"whatsapp\",\"data\":{\"context\":{\"ProfileName\":\"Andres Villamizar\",\"WaId\":\"34631021622\"}}}",
  "From": "whatsapp:+34631021622",
  "ApiVersion": "2010-04-01"
};

const statusUpdateData = {
  "MessagingServiceSid": "MG972e6fe335dae13e4f62e404cddccfef",
  "ApiVersion": "2010-04-01",
  "MessageStatus": "queued",
  "SmsSid": "SM8d11e7d6f658bec61ac98451ba314386",
  "SmsStatus": "queued",
  "To": "whatsapp:+34631021622",
  "From": "whatsapp:+34603960818",
  "MessageSid": "SM8d11e7d6f658bec61ac98451ba314386",
  "AccountSid": "AC0a1ea4a16c636b103a573164052f1f14"
};

console.log('🧪 TESTING WEBHOOK FILTERING LOGIC');
console.log('=====================================');

// Test 1: Mensaje entrante real
console.log('\n📥 Test 1: Mensaje entrante real');
const isIncomingMessage1 = testWebhookData.SmsStatus === 'received' && testWebhookData.Body;
console.log('SmsStatus:', testWebhookData.SmsStatus);
console.log('Body:', testWebhookData.Body);
console.log('isIncomingMessage:', isIncomingMessage1);
console.log('Resultado esperado: true');

// Test 2: Status update
console.log('\n📥 Test 2: Status update');
const isIncomingMessage2 = statusUpdateData.SmsStatus === 'received' && statusUpdateData.Body;
console.log('SmsStatus:', statusUpdateData.SmsStatus);
console.log('Body:', statusUpdateData.Body);
console.log('isIncomingMessage:', isIncomingMessage2);
console.log('Resultado esperado: false');

console.log('\n✅ Tests completados'); 