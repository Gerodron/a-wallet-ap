'use client';

/**
 * @file Main wallet Zustand store.
 *
 * Holds addresses, balances, token list, active network, and UI preferences.
 * Only non-sensitive, non-volatile data is persisted to localStorage:
 *   - activeNetwork
 *   - isBalanceHidden
 *   - addresses (public keys — not secrets)
 *
 * Balances and tokens are kept in-memory only because they are fetched
 * fresh on every session start.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { NetworkType, Balance, Token } from '@/lib/types/wallet';

// ---------------------------------------------------------------------------
// State shape
// ---------------------------------------------------------------------------

interface WalletState {
  isInitialized: boolean;
  activeNetwork: NetworkType;
  addresses: Record<NetworkType, string>;
  balances: Record<NetworkType, Balance>;
  tokens: Token[];
  totalValueUSD: number;
  isBalanceHidden: boolean;
  isLoadingBalances: boolean;

  // Actions
  setInitialized: (value: boolean) => void;
  setActiveNetwork: (network: NetworkType) => void;
  setAddresses: (addresses: Record<NetworkType, string>) => void;
  setBalance: (network: NetworkType, balance: Balance) => void;
  setTokens: (tokens: Token[]) => void;
  setTotalValueUSD: (value: number) => void;
  toggleBalanceVisibility: () => void;
  setLoadingBalances: (loading: boolean) => void;
  reset: () => void;
}

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

const DEFAULT_BALANCE: Balance = { native: 0, nativeSymbol: '', nativeUSD: 0, tokens: [] };

const INITIAL_STATE = {
  isInitialized: false,
  activeNetwork: 'solana' as NetworkType,
  addresses: { solana: '', bitcoin: '', bnb: '' } as Record<NetworkType, string>,
  balances: {
    solana: { ...DEFAULT_BALANCE, nativeSymbol: 'SOL' },
    bitcoin: { ...DEFAULT_BALANCE, nativeSymbol: 'BTC' },
    bnb: { ...DEFAULT_BALANCE, nativeSymbol: 'BNB' },
  } as Record<NetworkType, Balance>,
  tokens: [] as Token[],
  totalValueUSD: 0,
  isBalanceHidden: false,
  isLoadingBalances: false,
};

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useWalletStore = create<WalletState>()(
  persist(
    (set) => ({
      ...INITIAL_STATE,

      setInitialized: (value) => set({ isInitialized: value }),

      setActiveNetwork: (network) => set({ activeNetwork: network }),

      setAddresses: (addresses) => set({ addresses }),

      setBalance: (network, balance) =>
        set((state) => ({
          balances: { ...state.balances, [network]: balance },
        })),

      setTokens: (tokens) => set({ tokens }),

      setTotalValueUSD: (value) => set({ totalValueUSD: value }),

      toggleBalanceVisibility: () =>
        set((state) => ({ isBalanceHidden: !state.isBalanceHidden })),

      setLoadingBalances: (loading) => set({ isLoadingBalances: loading }),

      reset: () => set(INITIAL_STATE),
    }),
    {
      name: 'wallet-storage',
      partialize: (state) => ({
        activeNetwork: state.activeNetwork,
        isBalanceHidden: state.isBalanceHidden,
        addresses: state.addresses,
      }),
    },
  ),
);

// ---------------------------------------------------------------------------
// Selectors (prevent unnecessary re-renders)
// ---------------------------------------------------------------------------

export const selectActiveNetwork = (s: WalletState) => s.activeNetwork;
export const selectActiveBalance = (s: WalletState) => s.balances[s.activeNetwork];
export const selectTotalValueUSD = (s: WalletState) => s.totalValueUSD;
export const selectIsBalanceHidden = (s: WalletState) => s.isBalanceHidden;
