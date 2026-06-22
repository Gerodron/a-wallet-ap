/**
 * @file Per-network address validation.
 *
 * Validates blockchain addresses without making any network requests.
 * Uses format-only checks (length, character set, prefix, checksum
 * where feasible client-side).
 */

import type { NetworkType } from '@/lib/types/wallet';

// ---------------------------------------------------------------------------
// Base58 alphabet (Bitcoin / Solana)
// ---------------------------------------------------------------------------

const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
const BASE58_REGEX = new RegExp(`^[${BASE58_ALPHABET}]+$`);

// ---------------------------------------------------------------------------
// Validators per network
// ---------------------------------------------------------------------------

/**
 * Validate a **Solana** address.
 *
 * Solana addresses are base58-encoded Ed25519 public keys (32 bytes).
 * Encoded length is typically 32–44 characters.
 */
function isValidSolanaAddress(address: string): boolean {
  if (address.length < 32 || address.length > 44) return false;
  return BASE58_REGEX.test(address);
}

/**
 * Validate a **Bitcoin** address (mainnet only).
 *
 * Supports:
 *  - P2PKH  — starts with `1`, base58check, 25–34 chars
 *  - P2SH   — starts with `3`, base58check, 25–34 chars
 *  - Bech32 — starts with `bc1`, alphanumeric (no mixed case), 42–62 chars
 *
 * NOTE: We do NOT verify the full Base58Check checksum here to keep this
 * module dependency-free. A deeper check can be done before broadcasting.
 */
function isValidBitcoinAddress(address: string): boolean {
  // P2PKH or P2SH (legacy / wrapped-segwit)
  if (/^[13]/.test(address)) {
    if (address.length < 25 || address.length > 34) return false;
    return BASE58_REGEX.test(address);
  }

  // Native SegWit (Bech32 / Bech32m)
  if (address.startsWith('bc1')) {
    // Bech32 addresses are case-insensitive but must not mix cases.
    const lower = address.toLowerCase();
    if (lower !== address && address.toUpperCase() !== address) return false;
    if (lower.length < 42 || lower.length > 62) return false;
    // Bech32 character set: [a-z0-9] excluding 1, b, i, o (already handled by bc1 prefix)
    return /^bc1[ac-hj-np-z02-9]{39,59}$/.test(lower);
  }

  return false;
}

/**
 * Validate a **BNB Smart Chain** (EVM) address.
 *
 * EVM addresses are 20-byte hex values prefixed with `0x` (42 chars total).
 * We accept both checksummed (EIP-55) and lowercase forms.
 */
function isValidBnbAddress(address: string): boolean {
  if (address.length !== 42) return false;
  if (!address.startsWith('0x') && !address.startsWith('0X')) return false;
  return /^0x[0-9a-fA-F]{40}$/.test(address);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Validate a blockchain address for the given network.
 *
 * This performs **format-only** validation (no network calls).
 *
 * @param address - The address string to validate.
 * @param network - The target network.
 * @returns `true` if the address passes all format checks.
 */
export function validateAddress(
  address: string,
  network: NetworkType,
): boolean {
  if (!address || typeof address !== 'string') return false;

  const trimmed = address.trim();

  switch (network) {
    case 'solana':
      return isValidSolanaAddress(trimmed);
    case 'bitcoin':
      return isValidBitcoinAddress(trimmed);
    case 'bnb':
      return isValidBnbAddress(trimmed);
    default: {
      // Exhaustive check — if a new network is added the compiler will flag it.
      const _exhaustive: never = network;
      console.warn(`Unknown network: ${_exhaustive}`);
      return false;
    }
  }
}
