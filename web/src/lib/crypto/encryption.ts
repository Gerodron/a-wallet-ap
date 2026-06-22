/**
 * @file AES-256-GCM encryption / decryption using the Web Crypto API.
 *
 * This module is the *only* place where encryption logic lives.
 * It uses exclusively browser-native APIs (crypto.subtle) and never
 * falls back to Node.js `crypto`.
 *
 * Encryption scheme
 * -----------------
 *  1. Derive a 256-bit key from the user's PIN via PBKDF2-SHA-256
 *     with 600 000 iterations and a random 16-byte salt.
 *  2. Encrypt the plaintext with AES-256-GCM using a random 12-byte IV.
 *  3. Return { ciphertext, iv, salt } — all base-64 encoded.
 *
 * Security notes
 * --------------
 *  • The PIN never leaves the client.
 *  • Each encrypt() call generates fresh salt + IV, so identical
 *    plaintexts produce different ciphertexts.
 *  • PBKDF2 at 600 000 iterations follows current OWASP guidance.
 */

import type { EncryptedData } from '@/lib/types/wallet';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Number of PBKDF2 iterations (OWASP 2023+ recommendation). */
const PBKDF2_ITERATIONS = 600_000;

/** Salt length in bytes. */
const SALT_LENGTH = 16;

/** AES-GCM initialisation-vector length in bytes. */
const IV_LENGTH = 12;

// ---------------------------------------------------------------------------
// Helpers: base-64 ↔ Uint8Array
// ---------------------------------------------------------------------------

/**
 * Convert a `Uint8Array` to a base-64 encoded string.
 *
 * Works in both browser and edge-runtime (no `Buffer` dependency).
 */
export function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Decode a base-64 string back to a `Uint8Array`.
 */
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

// ---------------------------------------------------------------------------
// Environment Checks
// ---------------------------------------------------------------------------

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
      'Web Crypto API is not available. Encryption operations can only run in a secure browser context.',
    );
  }
}

// ---------------------------------------------------------------------------
// Key derivation
// ---------------------------------------------------------------------------

/**
 * Derive a 256-bit AES-GCM `CryptoKey` from a user PIN using PBKDF2.
 *
 * @param pin  - The user's PIN / passphrase.
 * @param salt - A 16-byte random salt.
 * @returns      A non-extractable CryptoKey suitable for AES-256-GCM.
 */
export async function deriveKeyFromPin(
  pin: string,
  salt: Uint8Array,
): Promise<CryptoKey> {
  assertCryptoAvailable();

  // Import the PIN as raw key material for PBKDF2.
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    getEncoder().encode(pin),
    'PBKDF2',
    false, // not extractable
    ['deriveKey'],
  );

  // Convert Uint8Array to ArrayBuffer specifically to satisfy typings
  // byteOffset and byteLength slicing into array buffer. We assert as ArrayBuffer
  // which works dynamically as Turbopack uses a clean environment.
  const saltBuffer = salt.buffer.slice(salt.byteOffset, salt.byteOffset + salt.byteLength) as ArrayBuffer;

  // Derive the actual AES-GCM key.
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBuffer,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false, // not extractable
    ['encrypt', 'decrypt'],
  );
}

// ---------------------------------------------------------------------------
// Encrypt
// ---------------------------------------------------------------------------

/**
 * Encrypt arbitrary plaintext with AES-256-GCM.
 *
 * A fresh 16-byte salt and 12-byte IV are generated per invocation so
 * that re-encrypting the same data yields different ciphertext.
 *
 * @param plaintext - The string to encrypt (typically a seed phrase).
 * @param pin       - The user's PIN used to derive the encryption key.
 * @returns           An {@link EncryptedData} object ready for JSON storage.
 */
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

// ---------------------------------------------------------------------------
// Decrypt
// ---------------------------------------------------------------------------

/**
 * Decrypt an {@link EncryptedData} blob back to the original plaintext.
 *
 * @param encrypted - The encrypted container (as stored in localStorage).
 * @param pin       - The user's PIN.
 * @returns           The original plaintext string.
 * @throws            If the PIN is wrong or the data has been tampered with
 *                    (AES-GCM authentication will fail).
 */
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
      'Decryption failed. The PIN may be incorrect or the data may have been tampered with.',
    );
  }
}
