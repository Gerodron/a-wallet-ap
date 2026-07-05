'use client';

/**
 * @file Estado de autenticación y seguridad.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const INACTIVITY_TIMEOUT = 15 * 60 * 1000;

interface AuthState {
  isAuthenticated: boolean;
  isLocked: boolean;
  jwtToken: string | null;
  failedAttempts: number;
  previousFailedAttempts: number;
  maxFailedAttempts: number;
  lastActivityTime: number;

  login: (token: string) => void;
  logout: () => void;
  lock: () => void;
  unlock: (token?: string) => void;
  setJwtToken: (token: string) => void;
  incrementFailedAttempts: () => void;
  resetFailedAttempts: () => void;
  setMaxFailedAttempts: (limit: number) => void;
  updateActivity: () => void;
}

const INITIAL_STATE = {
  isAuthenticated: false,
  isLocked: false,
  jwtToken: null as string | null,
  failedAttempts: 0,
  previousFailedAttempts: 0,
  maxFailedAttempts: 5,
  lastActivityTime: Date.now(),
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      ...INITIAL_STATE,

      login: (token) =>
        set((state) => ({
          isAuthenticated: true,
          isLocked: false,
          jwtToken: token,
          previousFailedAttempts: state.failedAttempts,
          failedAttempts: 0,
          lastActivityTime: Date.now(),
        })),

      logout: () => set({ ...INITIAL_STATE, maxFailedAttempts: get().maxFailedAttempts, lastActivityTime: Date.now() }),

      lock: () => set({ isLocked: true }),

      unlock: (token) =>
        set((state) => ({
          isLocked: false,
          previousFailedAttempts: state.failedAttempts,
          failedAttempts: 0,
          lastActivityTime: Date.now(),
          jwtToken: token ?? state.jwtToken,
        })),

      setJwtToken: (token) => set({ jwtToken: token }),

      incrementFailedAttempts: () => {
        const next = get().failedAttempts + 1;
        if (next >= get().maxFailedAttempts) {
          set({ ...INITIAL_STATE, maxFailedAttempts: get().maxFailedAttempts, lastActivityTime: Date.now() });
          try {
            if (typeof window !== 'undefined') {
              localStorage.clear();
              window.location.reload();
            }
          } catch {
            // Ignorado
          }
          return;
        }
        set({ failedAttempts: next });
      },

      resetFailedAttempts: () => set({ failedAttempts: 0 }),
      
      setMaxFailedAttempts: (limit: number) => set({ maxFailedAttempts: limit }),

      updateActivity: () => set({ lastActivityTime: Date.now() }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        isLocked: state.isLocked,
        failedAttempts: state.failedAttempts,
        previousFailedAttempts: state.previousFailedAttempts,
        maxFailedAttempts: state.maxFailedAttempts,
        lastActivityTime: state.lastActivityTime,
      }),
    },
  ),
);

export const selectIsSessionActive = (s: AuthState) =>
  s.isAuthenticated && !s.isLocked;

export const selectRemainingAttempts = (s: AuthState) =>
  s.maxFailedAttempts - s.failedAttempts;
