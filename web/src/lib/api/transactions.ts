/**
 * @file Transaction API methods.
 *
 * All functions return typed data via the shared {@link api} client,
 * which handles JWT injection and error parsing automatically.
 */

import { api } from './client';
import type {
  BroadcastRequest,
  BroadcastResponse,
  Transaction,
  FeeEstimate,
} from '@/lib/types/transaction';
import type { PaginatedResponse } from '@/lib/types/api';

// ---------------------------------------------------------------------------
// Broadcast
// ---------------------------------------------------------------------------

/**
 * Broadcast a signed transaction to the network.
 *
 * @param request - Signed transaction payload.
 * @returns The on-chain hash and initial status.
 */
export function broadcastTransaction(
  request: BroadcastRequest,
): Promise<BroadcastResponse> {
  return api.post<BroadcastResponse>('/transactions/broadcast', request);
}

// ---------------------------------------------------------------------------
// History
// ---------------------------------------------------------------------------

/**
 * Fetch paginated transaction history for a wallet.
 *
 * @param uid     - Backend user ID.
 * @param network - Network filter.
 * @param page    - 1-indexed page number (default: 1).
 */
export function getTransactionHistory(
  uid: string,
  network: string,
  page = 1,
): Promise<PaginatedResponse<Transaction>> {
  const params = new URLSearchParams({
    network,
    page: String(page),
  });
  return api.get<PaginatedResponse<Transaction>>(
    `/transactions/history/${uid}?${params.toString()}`,
  );
}

// ---------------------------------------------------------------------------
// Status
// ---------------------------------------------------------------------------

/**
 * Poll the status of a single transaction.
 *
 * @param hash - On-chain transaction hash / signature.
 */
export function getTransactionStatus(hash: string): Promise<Transaction> {
  return api.get<Transaction>(`/transactions/status/${hash}`);
}

// ---------------------------------------------------------------------------
// Fee estimation
// ---------------------------------------------------------------------------

/**
 * Estimate the network fee for a transfer.
 *
 * @param network - Target network.
 * @param from    - Sender address.
 * @param to      - Recipient address.
 * @param amount  - Amount in native units.
 */
export function estimateFee(
  network: string,
  from: string,
  to: string,
  amount: number,
): Promise<FeeEstimate> {
  const params = new URLSearchParams({
    network,
    from,
    to,
    amount: String(amount),
  });
  return api.get<FeeEstimate>(`/transactions/estimate-fee?${params.toString()}`);
}
