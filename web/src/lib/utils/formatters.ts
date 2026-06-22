/**
 * @file Utility formatting functions.
 *
 * Pure functions for consistent display of currencies, crypto amounts,
 * addresses, and dates across the application.
 */

import { formatDistanceToNow, format, parseISO } from 'date-fns';

import { ADDRESS_TRUNCATE_CHARS, DEFAULT_FIAT_CURRENCY } from './constants';

// ---------------------------------------------------------------------------
// Currency
// ---------------------------------------------------------------------------

/**
 * Format a number as a fiat currency string.
 *
 * Uses `Intl.NumberFormat` for locale-aware formatting.
 *
 * @param amount   - The numeric amount.
 * @param currency - ISO-4217 currency code (default: "USD").
 * @returns A formatted string, e.g. "$1,234.56".
 *
 * @example
 * formatCurrency(1234.5)           // "$1,234.50"
 * formatCurrency(0.5, 'EUR')       // "€0.50"
 */
export function formatCurrency(
  amount: number,
  currency: string = DEFAULT_FIAT_CURRENCY,
): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// ---------------------------------------------------------------------------
// Crypto amounts
// ---------------------------------------------------------------------------

/**
 * Format a crypto amount to a sensible number of decimal places.
 *
 * Small values (< 0.01) get more decimals so the user can always
 * see meaningful digits.
 *
 * @param amount   - The numeric amount in human-readable units.
 * @param decimals - Maximum decimal places to show (default: 6).
 * @returns A formatted string, e.g. "0.001234".
 *
 * @example
 * formatCryptoAmount(1.23456789)        // "1.234568"
 * formatCryptoAmount(0.000001234, 9)    // "0.000001234"
 */
export function formatCryptoAmount(
  amount: number,
  decimals: number = 6,
): string {
  if (amount === 0) return '0';

  // For very small values, show more decimals so at least some
  // significant digits are visible.
  const abs = Math.abs(amount);
  const effectiveDecimals =
    abs < 0.0001 ? Math.min(decimals + 3, 18) :
    abs < 0.01   ? Math.min(decimals + 1, 18) :
    decimals;

  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: effectiveDecimals,
    useGrouping: true,
  }).format(amount);
}

// ---------------------------------------------------------------------------
// Addresses
// ---------------------------------------------------------------------------

/**
 * Truncate a blockchain address for display.
 *
 * @param address - The full address string.
 * @param chars   - Number of characters to show on each side (default: 6).
 * @returns A truncated string like "0xAbCd…1234".
 *
 * @example
 * truncateAddress('0x1234567890abcdef1234567890abcdef12345678')
 * // "0x1234…5678"
 */
export function truncateAddress(
  address: string,
  chars: number = ADDRESS_TRUNCATE_CHARS,
): string {
  if (!address) return '';
  if (address.length <= chars * 2 + 3) return address; // already short enough

  return `${address.slice(0, chars)}…${address.slice(-chars)}`;
}

// ---------------------------------------------------------------------------
// Dates
// ---------------------------------------------------------------------------

/**
 * Format an ISO-8601 date string to a human-readable format.
 *
 * @param date - ISO-8601 date string (e.g. from the API).
 * @returns A formatted string like "Jun 15, 2026, 6:30 PM".
 */
export function formatDate(date: string): string {
  try {
    return format(parseISO(date), 'MMM d, yyyy, h:mm a');
  } catch {
    return date; // Return the raw string if parsing fails.
  }
}

/**
 * Format an ISO-8601 date string as a relative time.
 *
 * @param date - ISO-8601 date string.
 * @returns A string like "5 minutes ago" or "2 hours ago".
 */
export function formatRelativeTime(date: string): string {
  try {
    return formatDistanceToNow(parseISO(date), { addSuffix: true });
  } catch {
    return date;
  }
}

// ---------------------------------------------------------------------------
// Misc
// ---------------------------------------------------------------------------

/**
 * Convert a lamports / satoshi / wei integer to human-readable units.
 *
 * @param raw      - The raw integer amount (bigint-safe).
 * @param decimals - Number of decimal places for the network's native asset.
 * @returns The human-readable amount as a number.
 *
 * @example
 * fromSmallestUnit(1_000_000_000n, 9) // 1 (SOL)
 * fromSmallestUnit(100_000_000n, 8)   // 1 (BTC)
 */
export function fromSmallestUnit(raw: bigint | number, decimals: number): number {
  const divisor = 10 ** decimals;
  return Number(raw) / divisor;
}

/**
 * Convert a human-readable amount to the smallest on-chain unit.
 *
 * @param amount   - Human-readable amount (e.g. 1.5 SOL).
 * @param decimals - Decimal places.
 * @returns The raw integer as a bigint.
 *
 * @example
 * toSmallestUnit(1.5, 9) // 1_500_000_000n (lamports)
 */
export function toSmallestUnit(amount: number, decimals: number): bigint {
  const multiplier = 10 ** decimals;
  // Use Math.round to avoid floating-point drift.
  return BigInt(Math.round(amount * multiplier));
}
