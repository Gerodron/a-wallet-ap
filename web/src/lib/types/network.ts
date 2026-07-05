import type { NetworkType } from './wallet';
export type { NetworkType } from './wallet';

export interface NetworkConfig {
  name: string;
  symbol: string;
  chainId?: number;
  rpcUrl: string;
  wsUrl?: string;
  explorerUrl: string;
  derivationPath: string;
  decimals: number;
  icon: string;
  color: string;
}

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
