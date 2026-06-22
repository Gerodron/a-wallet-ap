'use client';

import React from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { ToastContainer } from '@/components/ui';
import { useUIStore } from '@/lib/store/ui-store';
import { useAuthStore } from '@/lib/store/auth-store';
import { useInactivityTimer } from '@/lib/hooks/useInactivityTimer';

export function CoreLayout({ children }: { children: React.ReactNode }) {
  const { notifications, removeNotification } = useUIStore();
  const { isAuthenticated } = useAuthStore();
  
  // Activate global inactivity detector
  useInactivityTimer();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
        <main className="w-full max-w-lg animate-fade-in-up">
          {children}
        </main>
        <ToastContainer toasts={notifications} onDismiss={removeNotification} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen max-h-screen overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 md:pb-6">
          <div className="max-w-5xl mx-auto w-full animate-fade-in-up">
            {children}
          </div>
        </main>
      </div>
      <BottomNav />
      <ToastContainer toasts={notifications} onDismiss={removeNotification} />
    </div>
  );
}
