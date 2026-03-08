// Simple Node.js test demonstrating AES-256-GCM encrypt/decrypt compatibility (ESM)
import { randomBytes, createCipheriv, createDecipheriv } from 'crypto';

const IV_LENGTH = 12;

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
  const pt = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return pt;
}

function toB64(buf) { return buf.toString('base64'); }

(async () => {
  const key = randomBytes(32);
  const plaintext = Buffer.from('Hello AES-GCM compatibility test from Node');

  console.log('Key (base64):', toB64(key));

  const { iv, ciphertext, tag } = encryptGcm(key, plaintext);
  const packet = Buffer.concat([iv, ciphertext, tag]);

  console.log('Packet (base64):', toB64(packet));

  // Simulate unpacking on receiver
  const recvIv = packet.slice(0, IV_LENGTH);
  const recvTag = packet.slice(packet.length - 16);
  const recvCipher = packet.slice(IV_LENGTH, packet.length - 16);

  const decrypted = decryptGcm(key, recvIv, recvCipher, recvTag);
  console.log('Decrypted:', decrypted.toString());

  // Intentional tamper test (should throw)
  try {
    const tampered = Buffer.from(packet);
    tampered[20] = tampered[20] ^ 1;
    const tIv = tampered.slice(0, IV_LENGTH);
    const tTag = tampered.slice(tampered.length - 16);
    const tCipher = tampered.slice(IV_LENGTH, tampered.length - 16);
    decryptGcm(key, tIv, tCipher, tTag);
    console.error('Tamper check failed: decryption succeeded unexpectedly');
  } catch (err) {
    console.log('Tamper detected as expected:', err.message);
  }
})();
