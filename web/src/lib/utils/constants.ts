/**
 * @file Application-wide constants.
 *
 * Single source of truth for derivation paths, network metadata,
 * storage keys, and other values used across modules.
 */

// ---------------------------------------------------------------------------
// BIP-44 derivation paths
// ---------------------------------------------------------------------------

/** Standard derivation paths per network. */
export const DERIVATION_PATHS = {
  /** Solana (Ed25519, all hardened). */
  solana: "m/44'/501'/0'/0'",
  /** Bitcoin (secp256k1, P2PKH). */
  bitcoin: "m/44'/0'/0'/0/0",
  /** BNB Smart Chain / Ethereum (secp256k1). */
  bnb: "m/44'/60'/0'/0/0",
} as const;

// ---------------------------------------------------------------------------
// Encryption
// ---------------------------------------------------------------------------

/** PBKDF2 iteration count for PIN → AES key derivation. */
export const PBKDF2_ITERATIONS = 600_000;

/** Salt length in bytes. */
export const SALT_LENGTH = 16;

/** AES-GCM IV length in bytes. */
export const IV_LENGTH = 12;

// ---------------------------------------------------------------------------
// Local storage keys
// ---------------------------------------------------------------------------

/** Keys used to persist data in `localStorage`. */
export const STORAGE_KEYS = {
  /** Encrypted seed phrase blob (JSON-serialised EncryptedData). */
  ENCRYPTED_SEED: 'wallet:encrypted_seed',
  /** Active network identifier. */
  ACTIVE_NETWORK: 'wallet:active_network',
  /** Cached addresses (JSON-serialised DerivedWallet). */
  ADDRESSES: 'wallet:addresses',
  /** User preferences / settings. */
  SETTINGS: 'wallet:settings',
  /** Theme preference. */
  THEME: 'wallet:theme',
} as const;

// ---------------------------------------------------------------------------
// API
// ---------------------------------------------------------------------------

/** Base URL for the backend API. */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001/api';

// ---------------------------------------------------------------------------
// UI defaults
// ---------------------------------------------------------------------------

/** Default number of characters shown on each side when truncating an address. */
export const ADDRESS_TRUNCATE_CHARS = 6;

/** Default fiat currency for display. */
export const DEFAULT_FIAT_CURRENCY = 'USD';

/** Maximum mnemonic length accepted (24 words × ~10 chars + spaces). */
export const MAX_MNEMONIC_LENGTH = 300;

// ---------------------------------------------------------------------------
// Timeouts & intervals
// ---------------------------------------------------------------------------

/** Auto-lock timeout in milliseconds (5 minutes). */
export const AUTO_LOCK_TIMEOUT_MS = 5 * 60 * 1000;

/** Balance polling interval in milliseconds (30 seconds). */
export const BALANCE_POLL_INTERVAL_MS = 30 * 1000;

/** Price polling interval in milliseconds (60 seconds). */
export const PRICE_POLL_INTERVAL_MS = 60 * 1000;
