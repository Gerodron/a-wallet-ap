/**
 * @file Encriptación y desencriptación AES-256-GCM.
 */

import type { EncryptedData } from '@/lib/types/wallet';

const PBKDF2_ITERATIONS = 600_000;
const SALT_LENGTH = 16;
const IV_LENGTH = 12;

export function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

let _encoder: TextEncoder | null = null;
let _decoder: TextDecoder | null = null;

function getEncoder(): TextEncoder {
  if (!_encoder) _encoder = new TextEncoder();
  return _encoder;
}

function getDecoder(): TextDecoder {
  if (!_decoder) _decoder = new TextDecoder();
  return _decoder;
}

function isCryptoAvailable(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.crypto !== 'undefined' &&
    typeof window.crypto.subtle !== 'undefined'
  );
}

function assertCryptoAvailable(): void {
  if (!isCryptoAvailable()) {
    throw new Error(
      'La API Web Crypto no está disponible. Las operaciones de cifrado requieren un contexto seguro.',
    );
  }
}

export async function deriveKeyFromPin(
  pin: string,
  salt: Uint8Array,
): Promise<CryptoKey> {
  assertCryptoAvailable();

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    getEncoder().encode(pin),
    'PBKDF2',
    false,
    ['deriveKey'],
  );

  const saltBuffer = salt.buffer.slice(salt.byteOffset, salt.byteOffset + salt.byteLength) as ArrayBuffer;

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBuffer,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

export async function encryptData(
  plaintext: string,
  pin: string,
): Promise<EncryptedData> {
  assertCryptoAvailable();

  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const key = await deriveKeyFromPin(pin, salt);

  const ivBuffer = iv.buffer.slice(iv.byteOffset, iv.byteOffset + iv.byteLength) as ArrayBuffer;

  const ciphertextBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: ivBuffer },
    key,
    getEncoder().encode(plaintext),
  );

  return {
    ciphertext: uint8ArrayToBase64(new Uint8Array(ciphertextBuffer)),
    iv: uint8ArrayToBase64(iv),
    salt: uint8ArrayToBase64(salt),
  };
}

export async function decryptData(
  encrypted: EncryptedData,
  pin: string,
): Promise<string> {
  assertCryptoAvailable();

  const salt = base64ToUint8Array(encrypted.salt);
  const iv = base64ToUint8Array(encrypted.iv);
  const ciphertext = base64ToUint8Array(encrypted.ciphertext);

  const key = await deriveKeyFromPin(pin, salt);

  const ivBuffer = iv.buffer.slice(iv.byteOffset, iv.byteOffset + iv.byteLength) as ArrayBuffer;
  const ciphertextBuffer = ciphertext.buffer.slice(ciphertext.byteOffset, ciphertext.byteOffset + ciphertext.byteLength) as ArrayBuffer;

  try {
    const plaintextBuffer = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: ivBuffer },
      key,
      ciphertextBuffer,
    );

    return getDecoder().decode(plaintextBuffer);
  } catch {
    throw new Error(
      'Fallo en la desencriptación. El PIN podría ser incorrecto.',
    );
  }
}
