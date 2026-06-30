import { api } from './client';

export interface RegisterRequest {
  username: string;
  pin: string;
  addresses: Record<string, string>;
}

export interface AuthResponse {
  token: string;
  username: string;
}

export interface BalanceItem {
  native: number;
  nativeSymbol: string;
  nativeUSD: number;
}

export interface TransferRequest {
  fromAddress: string;
  toAddress: string;
  amount: number;
  network: string;
  pin: string;
}

export const financeService = {
  /**
   * Registers a new user and links their public key addresses.
   */
  register: (payload: RegisterRequest): Promise<AuthResponse> => {
    return api.post<AuthResponse>('/auth/register', payload);
  },

  /**
   * Authenticates the user with their secure access PIN.
   */
  login: (pin: string): Promise<AuthResponse> => {
    return api.post<AuthResponse>('/auth/login', { pin });
  },

  /**
   * Obtains consolidated real-time balances for the active account.
   */
  getBalances: (): Promise<Record<string, BalanceItem>> => {
    return api.get<Record<string, BalanceItem>>('/accounts/balances');
  },

  /**
   * Executes a transfer to a recipient address.
   */
  transfer: (payload: TransferRequest): Promise<{ txHash: string }> => {
    return api.post<{ txHash: string }>('/transactions/transfer', payload);
  },

  /**
   * Preventive lock of a cryptocurrency address/account.
   */
  blockAccount: (accountId: string, pin: string): Promise<{ success: boolean }> => {
    return api.post<{ success: boolean }>('/accounts/block', { accountId, pin });
  }
};
