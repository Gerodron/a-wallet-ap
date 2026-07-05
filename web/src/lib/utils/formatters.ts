/**
 * @file Funciones de formateo.
 */
import { formatDistanceToNow, format, parseISO } from 'date-fns';
import { ADDRESS_TRUNCATE_CHARS, DEFAULT_FIAT_CURRENCY } from './constants';

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

export function formatCryptoAmount(
  amount: number,
  decimals: number = 6,
): string {
  if (amount === 0) return '0';

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

export function truncateAddress(
  address: string,
  chars: number = ADDRESS_TRUNCATE_CHARS,
): string {
  if (!address) return '';
  if (address.length <= chars * 2 + 3) return address;

  return `${address.slice(0, chars)}…${address.slice(-chars)}`;
}

export function formatDate(date: string): string {
  try {
    return format(parseISO(date), 'MMM d, yyyy, h:mm a');
  } catch {
    return date;
  }
}

export function formatRelativeTime(date: string): string {
  try {
    return formatDistanceToNow(parseISO(date), { addSuffix: true });
  } catch {
    return date;
  }
}

export function fromSmallestUnit(raw: bigint | number, decimals: number): number {
  const divisor = 10 ** decimals;
  return Number(raw) / divisor;
}

export function toSmallestUnit(amount: number, decimals: number): bigint {
  const multiplier = 10 ** decimals;
  return BigInt(Math.round(amount * multiplier));
}
