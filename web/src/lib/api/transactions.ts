/**
 * @file Métodos de la API de transacciones.
 */

import { api } from './client';
import type {
  BroadcastRequest,
  BroadcastResponse,
  Transaction,
  FeeEstimate,
} from '@/lib/types/transaction';
import type { PaginatedResponse } from '@/lib/types/api';

export function broadcastTransaction(
  request: BroadcastRequest,
): Promise<BroadcastResponse> {
  return api.post<BroadcastResponse>('/transactions/broadcast', request);
}

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

export function getTransactionStatus(hash: string): Promise<Transaction> {
  return api.get<Transaction>(`/transactions/status/${hash}`);
}

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
