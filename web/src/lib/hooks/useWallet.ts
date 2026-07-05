'use client';

/**
 * @file Hook principal de la wallet.
 */

import { useMemo, useCallback } from 'react';
import { useWalletStore } from '@/lib/store/wallet-store';
import type { NetworkType } from '@/lib/types/wallet';

export function useWallet() {
  const isInitialized = useWalletStore((s) => s.isInitialized);
  const activeNetwork = useWalletStore((s) => s.activeNetwork);
  const addresses = useWalletStore((s) => s.addresses);
  const balances = useWalletStore((s) => s.balances);
  const tokens = useWalletStore((s) => s.tokens);
  const totalValueUSD = useWalletStore((s) => s.totalValueUSD);
  const isBalanceHidden = useWalletStore((s) => s.isBalanceHidden);
  const isLoadingBalances = useWalletStore((s) => s.isLoadingBalances);

  const setActiveNetwork = useWalletStore((s) => s.setActiveNetwork);
  const toggleBalanceVisibility = useWalletStore((s) => s.toggleBalanceVisibility);
  const setAddresses = useWalletStore((s) => s.setAddresses);
  const reset = useWalletStore((s) => s.reset);
  const setInitialized = useWalletStore((s) => s.setInitialized);
  const setLoadingBalances = useWalletStore((s) => s.setLoadingBalances);

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
      // Error silencioso, la interfaz mostrará datos anteriores
    } finally {
      setLoadingBalances(false);
    }
  }, [setLoadingBalances]);

  return {
    isInitialized,
    activeNetwork,
    addresses,
    balances,
    tokens,
    totalValueUSD,
    isBalanceHidden,
    isLoadingBalances,
    activeAddress,
    activeBalance,
    activeTokens,
    displayBalance,
    displayUSD,
    switchNetwork,
    toggleBalanceVisibility,
    setAddresses,
    setInitialized,
    reset,
    refreshBalances,
    setActiveNetwork,
  } as const;
}
