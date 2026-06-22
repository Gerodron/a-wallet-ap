'use client';

/**
 * @file Balance-fetching hook.
 *
 * Fetches the native balance for a given network + address on mount
 * and then re-fetches on a 30-second polling interval. Writes results
 * directly into the wallet store.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useWalletStore } from '@/lib/store/wallet-store';
import type { NetworkType, Balance } from '@/lib/types/wallet';

const POLL_INTERVAL = 30_000;

interface UseBalanceOptions {
  pollInterval?: number;
  enabled?: boolean;
}

interface UseBalanceReturn {
  balance: Balance | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useBalance(
  network: NetworkType,
  address: string,
  opts: UseBalanceOptions = {},
): UseBalanceReturn {
  const { pollInterval = POLL_INTERVAL, enabled = true } = opts;

  const setBalance = useWalletStore((s) => s.setBalance);
  const setLoadingBalances = useWalletStore((s) => s.setLoadingBalances);

  const [balance, setLocalBalance] = useState<Balance | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mountedRef = useRef(true);

  const fetchBalance = useCallback(async () => {
    if (!address || !network) return;

    setIsLoading(true);
    setLoadingBalances(true);
    setError(null);

    try {
      // Mock balance retrieval based on network
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      let amount = 0;
      let symbol = 'SOL';
      if (network === 'solana') { amount = 25.425; symbol = 'SOL'; }
      else if (network === 'bitcoin') { amount = 0.0842; symbol = 'BTC'; }
      else if (network === 'bnb') { amount = 4.150; symbol = 'BNB'; }

      const mockData: Balance = {
        native: amount,
        nativeSymbol: symbol,
        nativeUSD: amount * (network === 'solana' ? 140 : network === 'bitcoin' ? 68000 : 580),
        tokens: []
      };

      if (mountedRef.current) {
        setLocalBalance(mockData);
        setBalance(network, mockData);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err : new Error(String(err)));
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
        setLoadingBalances(false);
      }
    }
  }, [network, address, setBalance, setLoadingBalances]);

  useEffect(() => {
    mountedRef.current = true;

    if (!enabled || !address) return;

    fetchBalance();

    const intervalId = window.setInterval(fetchBalance, pollInterval);

    return () => {
      mountedRef.current = false;
      window.clearInterval(intervalId);
    };
  }, [fetchBalance, pollInterval, enabled, address]);

  return { balance, isLoading, error, refetch: fetchBalance };
}
