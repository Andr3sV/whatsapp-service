const DEFAULT_TTL_MS = 60 * 60 * 1000; // 1 hora

// Mapa en memoria con expiración simple
const keyToExpiryMs = new Map();

function sweepExpired() {
  const now = Date.now();
  for (const [key, expiry] of keyToExpiryMs.entries()) {
    if (expiry <= now) keyToExpiryMs.delete(key);
  }
}

function isDuplicate(key) {
  if (!key) return false;
  sweepExpired();
  return keyToExpiryMs.has(key);
}

function markProcessed(key, ttlMs = DEFAULT_TTL_MS) {
  if (!key) return;
  sweepExpired();
  keyToExpiryMs.set(key, Date.now() + ttlMs);
}

module.exports = {
  isDuplicate,
  markProcessed,
};

