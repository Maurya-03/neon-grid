// Node.js TypeScript helpers for AES-256-GCM
import { randomBytes, createCipheriv, createDecipheriv } from "crypto";

export const IV_LENGTH = 12;

export function encryptGcmNode(key: Buffer, plaintext: Buffer): {
  iv: Buffer;
  ciphertext: Buffer;
  authTag: Buffer;
} {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return { iv, ciphertext, authTag };
}

export function decryptGcmNode(key: Buffer, iv: Buffer, ciphertext: Buffer, authTag: Buffer): Buffer {
  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);
  const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return plaintext;
}

// helper to pack/unpack packet format: [iv||ciphertext||authTag]
export function pack(iv: Buffer, ciphertext: Buffer, authTag: Buffer): Buffer {
  return Buffer.concat([iv, ciphertext, authTag]);
}

export function unpack(packet: Buffer): { iv: Buffer; ciphertext: Buffer; authTag: Buffer } {
  const iv = packet.slice(0, IV_LENGTH);
  const authTag = packet.slice(packet.length - 16);
  const ciphertext = packet.slice(IV_LENGTH, packet.length - 16);
  return { iv, ciphertext, authTag };
}
