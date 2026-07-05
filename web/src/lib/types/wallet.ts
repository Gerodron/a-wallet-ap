export type NetworkType = 'solana' | 'bitcoin' | 'bnb';

export interface WalletKeys {
  publicKey: string;
  address: string;
  network: NetworkType;
}

export interface DerivedWallet {
  solana: WalletKeys;
  bitcoin: WalletKeys;
  bnb: WalletKeys;
}

export interface Balance {
  native: number;
  nativeSymbol: string;
  nativeUSD: number;
  tokens: Token[];
}

export interface Token {
  symbol: string;
  name: string;
  mint: string;
  balance: number;
  decimals: number;
  usdValue: number;
  logoUrl?: string;
  network: NetworkType;
}

export interface EncryptedData {
  ciphertext: string;
  iv: string;
  salt: string;
}

export interface WalletIdentity {
  uid: string;
  addresses: Record<NetworkType, string>;
}
