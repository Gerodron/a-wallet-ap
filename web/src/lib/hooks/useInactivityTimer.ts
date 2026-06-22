'use client';

/**
 * @file Inactivity timer hook.
 *
 * Listens for user interaction events (mouse, keyboard, touch) and
 * auto-locks the wallet after 15 minutes of inactivity.
 *
 * The timer is checked via a 30-second polling interval rather than
 * a single `setTimeout` so that it self-corrects even if the device
 * was asleep.
 */

import { useEffect, useRef, useCallback } from 'react';
import { useAuthStore, INACTIVITY_TIMEOUT } from '@/lib/store/auth-store';

/** Events that count as "activity". */
const ACTIVITY_EVENTS: (keyof WindowEventMap)[] = [
  'mousemove',
  'keydown',
  'click',
  'touchstart',
  'scroll',
];

/** How often (ms) we check whether the timeout has been exceeded. */
const CHECK_INTERVAL = 30_000;

/**
 * Attaches activity listeners and an interval that auto-locks the
 * session after {@link INACTIVITY_TIMEOUT} ms of inactivity.
 *
 * Only active when the user is authenticated and the session is unlocked.
 *
 * @example
 * ```tsx
 * function AppShell({ children }: { children: React.ReactNode }) {
 *   useInactivityTimer();
 *   return <>{children}</>;
 * }
 * ```
 */
export function useInactivityTimer(): void {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLocked = useAuthStore((s) => s.isLocked);
  const updateActivity = useAuthStore((s) => s.updateActivity);
  const lock = useAuthStore((s) => s.lock);

  // Keep a stable ref so interval callback always reads latest store state.
  const storeRef = useRef(useAuthStore.getState);
  storeRef.current = useAuthStore.getState;

  /**
   * Throttled activity handler — updates the store at most once per second
   * to avoid flooding zustand with state updates on rapid mouse movements.
   */
  const lastUpdate = useRef(0);
  const handleActivity = useCallback(() => {
    const now = Date.now();
    if (now - lastUpdate.current > 1_000) {
      lastUpdate.current = now;
      updateActivity();
    }
  }, [updateActivity]);

  useEffect(() => {
    // Only run when session is active (authenticated & not locked)
    if (!isAuthenticated || isLocked) return;

    // — Attach event listeners —
    for (const evt of ACTIVITY_EVENTS) {
      window.addEventListener(evt, handleActivity, { passive: true });
    }

    // — Periodic check —
    const intervalId = window.setInterval(() => {
      const { lastActivityTime, isAuthenticated: authed, isLocked: locked } =
        storeRef.current();

      if (!authed || locked) return;

      if (Date.now() - lastActivityTime >= INACTIVITY_TIMEOUT) {
        lock();
      }
    }, CHECK_INTERVAL);

    // — Cleanup —
    return () => {
      for (const evt of ACTIVITY_EVENTS) {
        window.removeEventListener(evt, handleActivity);
      }
      window.clearInterval(intervalId);
    };
  }, [isAuthenticated, isLocked, handleActivity, lock]);
}
