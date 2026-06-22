import { api } from './client';
import type { NetworkType, Balance, Token } from '@/lib/types/wallet';

// ---------------------------------------------------------------------------
// Types (request-specific, not shared)
// ---------------------------------------------------------------------------

/** Payload for POST /wallets/register. */
export interface RegisterWalletRequest {
  uid: string;
  addresses: Record<NetworkType, string>;
}

/** Response from POST /wallets/register. */
export interface RegisterWalletResponse {
  success: boolean;
}

// ---------------------------------------------------------------------------
// Methods
// ---------------------------------------------------------------------------

/**
 * Register derived public addresses with the backend to associate them
 * with the user session (UID).
 */
export async function registerWallet(
  payload: RegisterWalletRequest,
): Promise<RegisterWalletResponse> {
  return api.post<RegisterWalletResponse>('/wallets/register', payload);
}

/**
 * Fetch native & token balances consolidated across all supported chains
 * for a specific user.
 *
 * @param uid - User ID.
 * @returns Balances for Solana, Bitcoin, and BNB.
 */
export async function fetchConsolidatedBalances(
  uid: string,
): Promise<Record<NetworkType, Balance>> {
  return api.get<Record<NetworkType, Balance>>(`/wallets/${uid}/balances`);
}

/**
 * Fetch fungible token holdings (SPL, BEP-20) for the user.
 *
 * @param uid - User ID.
 * @returns Array of token holdings across networks.
 */
export async function fetchTokenList(uid: string): Promise<Token[]> {
  return api.get<Token[]>(`/wallets/${uid}/tokens`);
}
