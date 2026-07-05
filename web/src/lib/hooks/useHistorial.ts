/**
 * @file Transaction history hook.
 *
 * Fetches paginated transaction history from the real API backend.
 * Manages loading, error and data states automatically.
 */

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api/client';

// ---------------------------------------------------------------------------
// Types (matching TransaccionHistorialDto and GetHistorialResponseDto)
// ---------------------------------------------------------------------------

export interface TransaccionHistorial {
  transaccionId: string;
  txHash: string;
  monto: number;
  red: string;
  direccionDestino: string;
  estadoTransaccion: string;
  fechaTransaccion: string;
  tipo: 'send' | 'receive';
}

export interface HistorialResponse {
  items: TransaccionHistorial[];
  totalItems: number;
  page: number;
  pageSize: number;
}

interface UseHistorialOptions {
  network?: string;
  page?: number;
  pageSize?: number;
  enabled?: boolean;
}

interface UseHistorialReturn {
  transactions: TransaccionHistorial[];
  totalItems: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useHistorial(opts: UseHistorialOptions = {}): UseHistorialReturn {
  const { network, page = 1, pageSize = 20, enabled = true } = opts;

  const [transactions, setTransactions] = useState<TransaccionHistorial[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
        if (network) params.set('network', network);

        const data = await api.get<HistorialResponse>(`/transactions/history?${params.toString()}`);

        if (!cancelled) {
          setTransactions(data.items ?? []);
          setTotalItems(data.totalItems ?? 0);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          const msg = err instanceof Error ? err.message : 'Error al cargar el historial.';
          setError(msg);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    load();

    return () => { cancelled = true; };
  }, [network, page, pageSize, enabled, tick]);

  return { transactions, totalItems, isLoading, error, refetch };
}
