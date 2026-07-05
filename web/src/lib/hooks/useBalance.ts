'use client';

/**
 * @file Hook para consultar balances.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useWalletStore } from '@/lib/store/wallet-store';
import type { NetworkType, Balance } from '@/lib/types/wallet';
import { financeService } from '@/lib/api/financeService';

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
      const response = await financeService.getBalances();
      
      const networkBalance = response[network] || {
        native: 0,
        nativeSymbol: network === 'solana' ? 'SOL' : network === 'bitcoin' ? 'BTC' : 'BNB',
        nativeUSD: 0
      };

      const finalData: Balance = {
        native: networkBalance.native,
        nativeSymbol: networkBalance.nativeSymbol,
        nativeUSD: networkBalance.nativeUSD,
        tokens: []
      };

      if (mountedRef.current) {
        setLocalBalance(finalData);
        setBalance(network, finalData);
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
