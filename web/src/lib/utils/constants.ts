/**
 * @file Constantes globales de la aplicación.
 */

export const DERIVATION_PATHS = {
  solana: "m/44'/501'/0'/0'",
  bitcoin: "m/44'/0'/0'/0/0",
  bnb: "m/44'/60'/0'/0/0",
} as const;

export const PBKDF2_ITERATIONS = 600_000;
export const SALT_LENGTH = 16;
export const IV_LENGTH = 12;

export const STORAGE_KEYS = {
  ENCRYPTED_SEED: 'wallet:encrypted_seed',
  ACTIVE_NETWORK: 'wallet:active_network',
  ADDRESSES: 'wallet:addresses',
  SETTINGS: 'wallet:settings',
  THEME: 'wallet:theme',
} as const;

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001/api';

export const ADDRESS_TRUNCATE_CHARS = 6;
export const DEFAULT_FIAT_CURRENCY = 'USD';
export const MAX_MNEMONIC_LENGTH = 300;

export const AUTO_LOCK_TIMEOUT_MS = 5 * 60 * 1000;
export const BALANCE_POLL_INTERVAL_MS = 30 * 1000;
export const PRICE_POLL_INTERVAL_MS = 60 * 1000;
