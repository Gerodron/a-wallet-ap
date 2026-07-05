'use client';

/**
 * @file Hook temporizador de inactividad.
 */

import { useEffect, useRef, useCallback } from 'react';
import { useAuthStore, INACTIVITY_TIMEOUT } from '@/lib/store/auth-store';

const ACTIVITY_EVENTS: (keyof WindowEventMap)[] = [
  'mousemove',
  'keydown',
  'click',
  'touchstart',
  'scroll',
];

const CHECK_INTERVAL = 30_000;

export function useInactivityTimer(): void {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLocked = useAuthStore((s) => s.isLocked);
  const updateActivity = useAuthStore((s) => s.updateActivity);
  const lock = useAuthStore((s) => s.lock);

  const storeRef = useRef(useAuthStore.getState);
  storeRef.current = useAuthStore.getState;

  const lastUpdate = useRef(0);
  const handleActivity = useCallback(() => {
    const now = Date.now();
    if (now - lastUpdate.current > 1_000) {
      lastUpdate.current = now;
      updateActivity();
    }
  }, [updateActivity]);

  useEffect(() => {
    if (!isAuthenticated || isLocked) return;

    for (const evt of ACTIVITY_EVENTS) {
      window.addEventListener(evt, handleActivity, { passive: true });
    }

    const intervalId = window.setInterval(() => {
      const { lastActivityTime, isAuthenticated: authed, isLocked: locked } =
        storeRef.current();

      if (!authed || locked) return;

      if (Date.now() - lastActivityTime >= INACTIVITY_TIMEOUT) {
        lock();
      }
    }, CHECK_INTERVAL);

    return () => {
      for (const evt of ACTIVITY_EVENTS) {
        window.removeEventListener(evt, handleActivity);
      }
      window.clearInterval(intervalId);
    };
  }, [isAuthenticated, isLocked, handleActivity, lock]);
}
