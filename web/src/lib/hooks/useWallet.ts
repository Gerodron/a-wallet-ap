'use client';

/**
 * @file Main wallet hook.
 *
 * Provides a convenient, component-friendly interface that combines
 * the wallet store state with derived values and common operations.
 * Components should prefer this hook over importing the raw store
 * so that selector patterns remain centralised.
 */

import { useMemo, useCallback } from 'react';
import { useWalletStore } from '@/lib/store/wallet-store';
import type { NetworkType } from '@/lib/types/wallet';

/**
 * All-in-one wallet hook for React components.
 */
export function useWallet() {
  // — Raw store slices (each selector keeps referential identity) —
  const isInitialized = useWalletStore((s) => s.isInitialized);
  const activeNetwork = useWalletStore((s) => s.activeNetwork);
  const addresses = useWalletStore((s) => s.addresses);
  const balances = useWalletStore((s) => s.balances);
  const tokens = useWalletStore((s) => s.tokens);
  const totalValueUSD = useWalletStore((s) => s.totalValueUSD);
  const isBalanceHidden = useWalletStore((s) => s.isBalanceHidden);
  const isLoadingBalances = useWalletStore((s) => s.isLoadingBalances);

  // — Actions (stable references) —
  const setActiveNetwork = useWalletStore((s) => s.setActiveNetwork);
  const toggleBalanceVisibility = useWalletStore((s) => s.toggleBalanceVisibility);
  const setAddresses = useWalletStore((s) => s.setAddresses);
  const reset = useWalletStore((s) => s.reset);
  const setInitialized = useWalletStore((s) => s.setInitialized);
  const setLoadingBalances = useWalletStore((s) => s.setLoadingBalances);

  // — Derived values —
  const activeAddress = addresses[activeNetwork];
  const activeBalance = balances[activeNetwork];
  const activeTokens = useMemo(
    () => tokens.filter((t) => t.network === activeNetwork),
    [tokens, activeNetwork],
  );

  const displayBalance = useMemo(() => {
    if (isBalanceHidden) return '••••••';
    return `${activeBalance?.native.toFixed(4) || '0.0000'} ${activeBalance?.nativeSymbol || ''}`;
  }, [isBalanceHidden, activeBalance]);

  const displayUSD = useMemo(() => {
    if (isBalanceHidden) return '••••••';
    return `$${totalValueUSD.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }, [isBalanceHidden, totalValueUSD]);

  const switchNetwork = useCallback(
    (network: NetworkType) => {
      setActiveNetwork(network);
    },
    [setActiveNetwork],
  );

  const refreshBalances = useCallback(async () => {
    setLoadingBalances(true);
    try {
      const { financeService } = await import('@/lib/api/financeService');
      const response = await financeService.getBalances();
      const { setBalance } = useWalletStore.getState();
      (['solana', 'bitcoin', 'bnb'] as const).forEach((net) => {
        const b = response[net];
        if (b) {
          setBalance(net, { native: b.native, nativeSymbol: b.nativeSymbol, nativeUSD: b.nativeUSD, tokens: [] });
        }
      });
    } catch {
      // silently swallow — balance card shows stale data with visual indicator
    } finally {
      setLoadingBalances(false);
    }
  }, [setLoadingBalances]);

  return {
    // State
    isInitialized,
    activeNetwork,
    addresses,
    balances,
    tokens,
    totalValueUSD,
    isBalanceHidden,
    isLoadingBalances,

    // Derived
    activeAddress,
    activeBalance,
    activeTokens,
    displayBalance,
    displayUSD,

    // Actions
    switchNetwork,
    toggleBalanceVisibility,
    setAddresses,
    setInitialized,
    reset,
    refreshBalances,
    setActiveNetwork,
  } as const;
}
