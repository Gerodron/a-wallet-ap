import type { NetworkType } from './wallet';

export type TransactionStatus = 'pending' | 'confirmed' | 'failed';
export type TransactionType = 'send' | 'receive' | 'swap';

export interface Transaction {
  hash: string;
  network: NetworkType;
  type: TransactionType;
  status: TransactionStatus;
  fromAddress: string;
  toAddress: string;
  amount: number;
  asset: string;
  fee: number;
  timestamp: string;
  confirmedAt?: string;
}

export interface BroadcastRequest {
  network: NetworkType;
  senderAddress: string;
  rawTransaction: string;
}

export interface BroadcastResponse {
  status: string;
  transactionHash: string;
  network: NetworkType;
  feeConsumed: number;
  timestamp: string;
}

export interface FeeEstimate {
  network: NetworkType;
  estimatedFee: number;
  feeSymbol: string;
  priority: 'low' | 'medium' | 'high';
}
