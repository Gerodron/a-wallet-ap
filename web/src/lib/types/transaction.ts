/**
 * @file Transaction type definitions.
 */

import type { NetworkType } from './wallet';

// ---------------------------------------------------------------------------
// Transaction record (from history endpoint / on-chain)
// ---------------------------------------------------------------------------

export type TransactionStatus = 'pending' | 'confirmed' | 'failed';
export type TransactionType = 'send' | 'receive' | 'swap';

export interface Transaction {
  /** On-chain transaction hash / signature. */
  hash: string;
  /** Network the tx occurred on. */
  network: NetworkType;
  /** Classification of this transaction. */
  type: TransactionType;
  /** Current confirmation status. */
  status: TransactionStatus;
  /** Sender address. */
  fromAddress: string;
  /** Recipient address. */
  toAddress: string;
  /** Amount transferred in human-readable units. */
  amount: number;
  /** Asset symbol (e.g. SOL, BTC, USDC). */
  asset: string;
  /** Fee paid in native units. */
  fee: number;
  /** ISO-8601 timestamp when the tx was submitted. */
  timestamp: string;
  /** ISO-8601 timestamp when the tx was confirmed (if applicable). */
  confirmedAt?: string;
}

// ---------------------------------------------------------------------------
// Broadcast
// ---------------------------------------------------------------------------

/** Payload sent to POST /transactions/broadcast. */
export interface BroadcastRequest {
  network: NetworkType;
  senderAddress: string;
  /** Serialised + signed transaction (hex or base-64 depending on network). */
  rawTransaction: string;
}

/** Response from POST /transactions/broadcast. */
export interface BroadcastResponse {
  status: string;
  transactionHash: string;
  network: NetworkType;
  feeConsumed: number;
  /** ISO-8601 timestamp. */
  timestamp: string;
}

// ---------------------------------------------------------------------------
// Fee estimation
// ---------------------------------------------------------------------------

/** Response from GET /transactions/estimate-fee. */
export interface FeeEstimate {
  network: NetworkType;
  /** Estimated fee in native units. */
  estimatedFee: number;
  /** Ticker symbol of the fee asset. */
  feeSymbol: string;
  /** Priority tier. */
  priority: 'low' | 'medium' | 'high';
}
