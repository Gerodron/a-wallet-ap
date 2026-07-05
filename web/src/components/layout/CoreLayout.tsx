'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { ToastContainer } from '@/components/ui';
import { useUIStore } from '@/lib/store/ui-store';
import { useAuthStore } from '@/lib/store/auth-store';
import { useInactivityTimer } from '@/lib/hooks/useInactivityTimer';

export function CoreLayout({ children }: { children: React.ReactNode }) {
  const { notifications, removeNotification } = useUIStore();
  const { isAuthenticated, jwtToken, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  // Activate global inactivity detector
  useInactivityTimer();

  useEffect(() => {
    const publicPaths = ['/', '/onboarding/create', '/onboarding/import'];

    // ── F5 / page-reload fix ──────────────────────────────────────────────
    // `isAuthenticated` is persisted in localStorage, but `jwtToken` is
    // kept in-memory only. After a hard reload the flag stays true but the
    // token is gone, making every authenticated API call return 401.
    // Detect that inconsistency and force a clean logout so the user goes
    // through the PIN screen and gets a fresh JWT.
    if (isAuthenticated && !jwtToken) {
      logout();
      if (!publicPaths.includes(pathname)) {
        router.push('/');
      }
      return;
    }

    if (!isAuthenticated) {
      if (!publicPaths.includes(pathname)) {
        router.push('/');
      }
    } else {
      if (publicPaths.includes(pathname)) {
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, jwtToken, pathname, router, logout]);

  const isPublicPath = ['/', '/onboarding/create', '/onboarding/import'].includes(pathname);

  if (!isAuthenticated) {
    if (!isPublicPath) {
      return (
        <div className="min-h-screen bg-bg-secondary flex items-center justify-center p-4">
          <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-accent-primary animate-spin" />
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-bg-secondary text-text-primary flex items-center justify-center p-4">
        <main className="w-full max-w-lg">
          {children}
        </main>
        <ToastContainer toasts={notifications} onDismiss={removeNotification} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-secondary text-text-primary flex flex-col md:flex-row">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen max-h-screen overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 md:pb-6 relative">
          <div className="max-w-5xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
      <BottomNav />
      <ToastContainer toasts={notifications} onDismiss={removeNotification} />
    </div>
  );
}
