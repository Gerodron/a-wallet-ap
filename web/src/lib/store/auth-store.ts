'use client';

/**
 * @file Authentication Zustand store.
 *
 * Security-critical design decisions:
 *  - JWT is kept **in-memory only** — never written to localStorage.
 *  - After {@link MAX_ATTEMPTS} consecutive failed PIN/auth attempts the
 *    store purges all state and forces a full re-authentication.
 *  - An inactivity timeout ({@link INACTIVITY_TIMEOUT}) auto-locks the
 *    wallet after 15 minutes of no user interaction. The actual timer
 *    lives in the `useInactivityTimer` hook; this store only holds the
 *    timestamp and `lock()` action.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Maximum consecutive failed authentication attempts before purge. */
const MAX_ATTEMPTS = 5;

/** Inactivity timeout in milliseconds (15 minutes). */
export const INACTIVITY_TIMEOUT = 15 * 60 * 1000;

// ---------------------------------------------------------------------------
// State shape
// ---------------------------------------------------------------------------

interface AuthState {
  /** True after the user has successfully authenticated this session. */
  isAuthenticated: boolean;
  /** True when the session is locked (e.g. due to inactivity). */
  isLocked: boolean;
  /**
   * JWT access token.
   * ⚠️ Kept in-memory only — **never** persisted to disk.
   */
  jwtToken: string | null;
  /** Rolling count of consecutive failed PIN/unlock attempts. */
  failedAttempts: number;
  /** Epoch-ms timestamp of the last meaningful user interaction. */
  lastActivityTime: number;

  // — Actions —
  login: (token: string) => void;
  logout: () => void;
  lock: () => void;
  unlock: (token?: string) => void;
  setJwtToken: (token: string) => void;
  incrementFailedAttempts: () => void;
  resetFailedAttempts: () => void;
  updateActivity: () => void;
}

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

const INITIAL_STATE = {
  isAuthenticated: false,
  isLocked: false,
  jwtToken: null as string | null,
  failedAttempts: 0,
  lastActivityTime: Date.now(),
};

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      ...INITIAL_STATE,

      /**
       * Authenticate the user and store the JWT (in-memory only).
       * Resets failed-attempt counter and refreshes activity timestamp.
       */
      login: (token) =>
        set({
          isAuthenticated: true,
          isLocked: false,
          jwtToken: token,
          failedAttempts: 0,
          lastActivityTime: Date.now(),
        }),

      /**
       * Full logout — clears JWT and resets all auth state.
       */
      logout: () => set({ ...INITIAL_STATE, lastActivityTime: Date.now() }),

      /**
       * Lock the session (e.g. after inactivity). The JWT is preserved
       * so the user can resume without a full login.
       */
      lock: () => set({ isLocked: true }),

      /**
       * Unlock an already-authenticated session.
       * Optionally refresh the JWT if the backend issued a new one.
       */
      unlock: (token) =>
        set((state) => ({
          isLocked: false,
          failedAttempts: 0,
          lastActivityTime: Date.now(),
          jwtToken: token ?? state.jwtToken,
        })),

      /** Replace the in-memory JWT (e.g. after a token refresh). */
      setJwtToken: (token) => set({ jwtToken: token }),

      /**
       * Increment the failed-attempt counter.
       * If the counter reaches {@link MAX_ATTEMPTS}, purge everything
       * and force a full re-authentication.
       */
      incrementFailedAttempts: () => {
        const next = get().failedAttempts + 1;
        if (next >= MAX_ATTEMPTS) {
          // Critical: wipe all auth state after too many failures
          set({ ...INITIAL_STATE, lastActivityTime: Date.now() });

          // Also clear any persisted wallet data
          try {
            if (typeof window !== 'undefined') {
              localStorage.removeItem('wallet-storage');
            }
          } catch {
            /* localStorage may be unavailable in some contexts */
          }

          return;
        }
        set({ failedAttempts: next });
      },

      /** Reset the failed-attempt counter (e.g. after a successful auth). */
      resetFailedAttempts: () => set({ failedAttempts: 0 }),

      /** Bump the last-activity timestamp to "now". */
      updateActivity: () => set({ lastActivityTime: Date.now() }),
    }),
    {
      name: 'auth-storage',
      /**
       * Persist only the bare minimum needed to detect a returning user.
       * The JWT is deliberately **excluded** — it lives in memory only.
       */
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        isLocked: state.isLocked,
        failedAttempts: state.failedAttempts,
        lastActivityTime: state.lastActivityTime,
      }),
    },
  ),
);

// ---------------------------------------------------------------------------
// Selectors
// ---------------------------------------------------------------------------

/** True when the user is authenticated AND the session is not locked. */
export const selectIsSessionActive = (s: AuthState) =>
  s.isAuthenticated && !s.isLocked;

/** Select remaining unlock attempts before forced purge. */
export const selectRemainingAttempts = (s: AuthState) =>
  MAX_ATTEMPTS - s.failedAttempts;
