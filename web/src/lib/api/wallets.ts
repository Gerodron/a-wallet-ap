import { api } from './client';
import type { NetworkType, Balance, Token } from '@/lib/types/wallet';

export interface RegisterWalletRequest {
  uid: string;
  addresses: Record<NetworkType, string>;
}

export interface RegisterWalletResponse {
  success: boolean;
}

export async function registerWallet(
  payload: RegisterWalletRequest,
): Promise<RegisterWalletResponse> {
  return api.post<RegisterWalletResponse>('/wallets/register', payload);
}

export async function fetchConsolidatedBalances(
  uid: string,
): Promise<Record<NetworkType, Balance>> {
  return api.get<Record<NetworkType, Balance>>(`/wallets/${uid}/balances`);
}

export async function fetchTokenList(uid: string): Promise<Token[]> {
  return api.get<Token[]>(`/wallets/${uid}/tokens`);
}
