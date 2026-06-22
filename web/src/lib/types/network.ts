/**
 * @file Network & RPC configuration types + static config map.
 *
 * Contains both the type definitions and the concrete NETWORK_CONFIGS
 * constant that is used throughout the application for derivation paths,
 * RPC endpoints, explorer URLs, etc.
 */

import type { NetworkType } from './wallet';

// Re-export for convenience so consumers can import from either file.
export type { NetworkType } from './wallet';

// ---------------------------------------------------------------------------
// Network config shape
// ---------------------------------------------------------------------------

/** Full descriptor for a supported network. */
export interface NetworkConfig {
  /** Human-readable name (e.g. "Solana"). */
  name: string;
  /** Native asset ticker (e.g. "SOL"). */
  symbol: string;
  /** EVM chain ID (only applicable for EVM-compatible networks). */
  chainId?: number;
  /** Primary JSON-RPC / REST endpoint. */
  rpcUrl: string;
  /** Optional WebSocket URL for subscriptions. */
  wsUrl?: string;
  /** Block-explorer base URL. */
  explorerUrl: string;
  /** BIP-44 derivation path. */
  derivationPath: string;
  /** Number of decimal places for the native asset. */
  decimals: number;
  /** Unicode icon / emoji for lightweight display. */
  icon: string;
  /** Brand colour (hex). */
  color: string;
}

// ---------------------------------------------------------------------------
// Static network configs
// ---------------------------------------------------------------------------

/**
 * Canonical configuration for every supported network.
 *
 * Derivation paths follow BIP-44:
 *  - Solana  : m/44'/501'/0'/0'      (all hardened, Ed25519)
 *  - Bitcoin : m/44'/0'/0'/0/0       (secp256k1, P2PKH)
 *  - BNB/BSC : m/44'/60'/0'/0/0     (secp256k1, same as Ethereum)
 */
export const NETWORK_CONFIGS: Record<NetworkType, NetworkConfig> = {
  solana: {
    name: 'Solana',
    symbol: 'SOL',
    rpcUrl: 'https://api.mainnet-beta.solana.com',
    wsUrl: 'wss://api.mainnet-beta.solana.com',
    explorerUrl: 'https://solscan.io',
    derivationPath: "m/44'/501'/0'/0'",
    decimals: 9,
    icon: '◎',
    color: '#9945FF',
  },
  bitcoin: {
    name: 'Bitcoin',
    symbol: 'BTC',
    rpcUrl: 'https://blockstream.info/api',
    explorerUrl: 'https://blockstream.info',
    derivationPath: "m/44'/0'/0'/0/0",
    decimals: 8,
    icon: '₿',
    color: '#F7931A',
  },
  bnb: {
    name: 'BNB Smart Chain',
    symbol: 'BNB',
    chainId: 56,
    rpcUrl: 'https://bsc-dataseed.binance.org/',
    explorerUrl: 'https://bscscan.com',
    derivationPath: "m/44'/60'/0'/0/0",
    decimals: 18,
    icon: '◆',
    color: '#F0B90B',
  },
};
