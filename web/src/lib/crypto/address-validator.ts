/**
 * @file Validación de direcciones por red.
 */

import type { NetworkType } from '@/lib/types/wallet';

const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
const BASE58_REGEX = new RegExp(`^[${BASE58_ALPHABET}]+$`);

function isValidSolanaAddress(address: string): boolean {
  if (address.length < 32 || address.length > 44) return false;
  return BASE58_REGEX.test(address);
}

function isValidBitcoinAddress(address: string): boolean {
  if (/^[13]/.test(address)) {
    if (address.length < 25 || address.length > 34) return false;
    return BASE58_REGEX.test(address);
  }

  if (address.startsWith('bc1')) {
    const lower = address.toLowerCase();
    if (lower !== address && address.toUpperCase() !== address) return false;
    if (lower.length < 42 || lower.length > 62) return false;
    return /^bc1[ac-hj-np-z02-9]{39,59}$/.test(lower);
  }

  return false;
}

function isValidBnbAddress(address: string): boolean {
  if (address.length !== 42) return false;
  if (!address.startsWith('0x') && !address.startsWith('0X')) return false;
  return /^0x[0-9a-fA-F]{40}$/.test(address);
}

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
      const _exhaustive: never = network;
      console.warn(`Red desconocida: ${_exhaustive}`);
      return false;
    }
  }
}
