// Browser (Web Crypto) helpers for AES-256-GCM
// Usage: provide a 32-byte key (Uint8Array) and plaintext (Uint8Array)

export const IV_LENGTH = 12; // 96 bits recommended for GCM

export function genIV(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(IV_LENGTH));
}

export async function importKey(rawKey: Uint8Array): Promise<CryptoKey> {
  return await crypto.subtle.importKey("raw", rawKey, "AES-GCM", false, [
    "encrypt",
    "decrypt",
  ]);
}

export function toBase64(buf: Uint8Array): string {
  return btoa(String.fromCharCode(...buf));
}

export function fromBase64(s: string): Uint8Array {
  const str = atob(s);
  const arr = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) arr[i] = str.charCodeAt(i);
  return arr;
}

export async function encryptGcm(
  keyBytes: Uint8Array,
  plaintext: Uint8Array,
): Promise<{ iv: Uint8Array; ciphertext: Uint8Array }>{
  const key = await importKey(keyBytes);
  const iv = genIV();
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, plaintext);
  return { iv, ciphertext: new Uint8Array(encrypted) };
}

export async function decryptGcm(
  keyBytes: Uint8Array,
  iv: Uint8Array,
  ciphertext: Uint8Array,
): Promise<Uint8Array> {
  const key = await importKey(keyBytes);
  const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ciphertext);
  return new Uint8Array(decrypted);
}
