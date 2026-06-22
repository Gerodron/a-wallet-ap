/**
 * @file Core wallet type definitions.
 *
 * These types are consumed by Zustand stores, custom hooks, crypto modules,
 * and API modules. Keep this file free of runtime code — types & interfaces only.
 */

// ---------------------------------------------------------------------------
// Network
// ---------------------------------------------------------------------------

/** Supported blockchain networks. */
export type NetworkType = 'solana' | 'bitcoin' | 'bnb';

// ---------------------------------------------------------------------------
// Wallet keys
// ---------------------------------------------------------------------------

/** Public key + derived address for a single network. */
export interface WalletKeys {
  /** Hex-encoded (or network-native-encoded) public key. */
  publicKey: string;
  /** Human-readable on-chain address. */
  address: string;
  /** Network this key-pair belongs to. */
  network: NetworkType;
}

/**
 * The full set of addresses derived from a single BIP-39 seed phrase.
 * One entry per supported network.
 */
export interface DerivedWallet {
  solana: WalletKeys;
  bitcoin: WalletKeys;
  bnb: WalletKeys;
}

// ---------------------------------------------------------------------------
// Balance
// ---------------------------------------------------------------------------

/** Native-asset balance for a single network. */
export interface Balance {
  /** Amount in native units (e.g. SOL, BTC, BNB). */
  native: number;
  /** Ticker symbol of the native asset. */
  nativeSymbol: string;
  /** USD-equivalent value of the native balance. */
  nativeUSD: number;
  /** SPL / BEP-20 / other fungible token holdings. */
  tokens: Token[];
}

// ---------------------------------------------------------------------------
// Token
// ---------------------------------------------------------------------------

/** SPL / BEP-20 / other fungible token held in the wallet. */
export interface Token {
  /** Ticker symbol (e.g. USDC, BONK). */
  symbol: string;
  /** Human-readable name. */
  name: string;
  /** On-chain mint / contract address. */
  mint: string;
  /** Token balance in human-readable (display) units. */
  balance: number;
  /** On-chain decimal precision. */
  decimals: number;
  /** Current USD value of the entire holding. */
  usdValue: number;
  /** Optional URL to the token's logo. */
  logoUrl?: string;
  /** Network on which this token exists. */
  network: NetworkType;
}

// ---------------------------------------------------------------------------
// Encryption
// ---------------------------------------------------------------------------

/**
 * Container for AES-256-GCM encrypted data.
 * All binary fields are base-64 encoded strings so they survive
 * JSON serialisation (e.g. localStorage).
 */
export interface EncryptedData {
  /** Base-64 encoded ciphertext (includes the GCM auth tag). */
  ciphertext: string;
  /** Base-64 encoded 12-byte initialisation vector. */
  iv: string;
  /** Base-64 encoded 16-byte PBKDF2 salt. */
  salt: string;
}

// ---------------------------------------------------------------------------
// Wallet identity (legacy / backend)
// ---------------------------------------------------------------------------

/** Minimal info needed to identify a wallet across networks. */
export interface WalletIdentity {
  /** Backend UID. */
  uid: string;
  /** Public addresses keyed by network. */
  addresses: Record<NetworkType, string>;
}
