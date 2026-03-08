// Replay protection test for AES-256-GCM packets (ESM)
import { randomBytes, createCipheriv, createDecipheriv } from 'crypto';

const IV_LENGTH = 12;
const NONCE_LENGTH = 12;
const TIMESTAMP_BYTES = 8; // 64-bit ms

function encryptGcm(key, plaintext) {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();
  return { iv, ciphertext, tag };
}

function decryptGcm(key, iv, ciphertext, tag) {
  const decipher = createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
}

function packWithReplay(iv, ciphertext, tag, timestampMs, nonce) {
  const tsBuf = Buffer.alloc(TIMESTAMP_BYTES);
  tsBuf.writeBigUInt64BE(BigInt(timestampMs));
  return Buffer.concat([iv, ciphertext, tag, tsBuf, nonce]);
}

function unpackWithReplay(packet) {
  const iv = packet.slice(0, IV_LENGTH);
  const tag = packet.slice(packet.length - TIMESTAMP_BYTES - NONCE_LENGTH - 16, packet.length - TIMESTAMP_BYTES - NONCE_LENGTH);
  const ciphertext = packet.slice(IV_LENGTH, packet.length - TIMESTAMP_BYTES - NONCE_LENGTH - 16);
  const tsStart = packet.length - TIMESTAMP_BYTES - NONCE_LENGTH;
  const tsBuf = packet.slice(tsStart, tsStart + TIMESTAMP_BYTES);
  const timestampMs = Number(tsBuf.readBigUInt64BE());
  const nonce = packet.slice(packet.length - NONCE_LENGTH);
  return { iv, ciphertext, tag, timestampMs, nonce };
}

// simple in-memory nonce store with TTL
class NonceStore {
  constructor(ttlMs = 60_000) {
    this.ttl = ttlMs;
    this.map = new Map();
  }
  mark(nonce) {
    const key = nonce.toString('hex');
    const now = Date.now();
    if (this.map.has(key)) return false; // already seen
    this.map.set(key, now + this.ttl);
    return true;
  }
  purge() {
    const now = Date.now();
    for (const [k, exp] of this.map.entries()) {
      if (exp <= now) this.map.delete(k);
    }
  }
}

(async () => {
  const key = randomBytes(32);
  const plaintext = Buffer.from('Replay protection test');
  const { iv, ciphertext, tag } = encryptGcm(key, plaintext);

  const timestamp = Date.now();
  const nonce = randomBytes(NONCE_LENGTH);
  const packet = packWithReplay(iv, ciphertext, tag, timestamp, nonce);

  console.log('Packet created.');

  // Receiver side verification
  const store = new NonceStore(30_000);

  function verifyAndDecrypt(packetBuf) {
    store.purge();
    const { iv, ciphertext, tag, timestampMs, nonce } = unpackWithReplay(packetBuf);
    const now = Date.now();
    const maxSkew = 60_000; // 60s
    if (Math.abs(now - timestampMs) > maxSkew) throw new Error('Timestamp outside allowed window');
    if (!store.mark(nonce)) throw new Error('Replay detected (nonce seen)');
    return decryptGcm(key, iv, ciphertext, tag);
  }

  // First attempt should succeed
  try {
    const pt = verifyAndDecrypt(packet);
    console.log('First decrypt OK:', pt.toString());
  } catch (err) {
    console.error('First decrypt failed:', err.message);
  }

  // Replay (same packet) should be detected
  try {
    const pt2 = verifyAndDecrypt(packet);
    console.error('Replay not detected, decrypted:', pt2.toString());
  } catch (err) {
    console.log('Replay detected as expected:', err.message);
  }

  // Tamper timestamp to be stale
  try {
    const stale = Buffer.from(packet);
    const staleTs = Buffer.alloc(TIMESTAMP_BYTES);
    staleTs.writeBigUInt64BE(BigInt(Date.now() - 120_000));
    stale.set(staleTs, packet.length - TIMESTAMP_BYTES - NONCE_LENGTH);
    verifyAndDecrypt(stale);
    console.error('Stale timestamp not detected');
  } catch (err) {
    console.log('Stale timestamp detected as expected:', err.message);
  }
})();
