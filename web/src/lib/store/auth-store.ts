'use client';

/**
 * @file Estado de autenticación y seguridad.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const MAX_ATTEMPTS = 5;
export const INACTIVITY_TIMEOUT = 15 * 60 * 1000;

interface AuthState {
  isAuthenticated: boolean;
  isLocked: boolean;
  jwtToken: string | null;
  failedAttempts: number;
  lastActivityTime: number;

  login: (token: string) => void;
  logout: () => void;
  lock: () => void;
  unlock: (token?: string) => void;
  setJwtToken: (token: string) => void;
  incrementFailedAttempts: () => void;
  resetFailedAttempts: () => void;
  updateActivity: () => void;
}

const INITIAL_STATE = {
  isAuthenticated: false,
  isLocked: false,
  jwtToken: null as string | null,
  failedAttempts: 0,
  lastActivityTime: Date.now(),
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      ...INITIAL_STATE,

      login: (token) =>
        set({
          isAuthenticated: true,
          isLocked: false,
          jwtToken: token,
          failedAttempts: 0,
          lastActivityTime: Date.now(),
        }),

      logout: () => set({ ...INITIAL_STATE, lastActivityTime: Date.now() }),

      lock: () => set({ isLocked: true }),

      unlock: (token) =>
        set((state) => ({
          isLocked: false,
          failedAttempts: 0,
          lastActivityTime: Date.now(),
          jwtToken: token ?? state.jwtToken,
        })),

      setJwtToken: (token) => set({ jwtToken: token }),

      incrementFailedAttempts: () => {
        const next = get().failedAttempts + 1;
        if (next >= MAX_ATTEMPTS) {
          set({ ...INITIAL_STATE, lastActivityTime: Date.now() });
          try {
            if (typeof window !== 'undefined') {
              localStorage.removeItem('wallet-storage');
            }
          } catch {
            // Ignorado
          }
          return;
        }
        set({ failedAttempts: next });
      },

      resetFailedAttempts: () => set({ failedAttempts: 0 }),
      updateActivity: () => set({ lastActivityTime: Date.now() }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        isLocked: state.isLocked,
        failedAttempts: state.failedAttempts,
        lastActivityTime: state.lastActivityTime,
      }),
    },
  ),
);

export const selectIsSessionActive = (s: AuthState) =>
  s.isAuthenticated && !s.isLocked;

export const selectRemainingAttempts = (s: AuthState) =>
  MAX_ATTEMPTS - s.failedAttempts;
