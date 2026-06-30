'use client';

import React from 'react';
import { NetworkSelector } from './NetworkSelector';
import { useWallet } from '@/lib/hooks/useWallet';
import { useAuthStore } from '@/lib/store/auth-store';
import { Bell, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

export function Header() {
  const { activeNetwork, addresses } = useWallet();
  const { isAuthenticated } = useAuthStore();
  const [copied, setCopied] = useState(false);
  const pathname = usePathname();

  if (!isAuthenticated) return null;

  const currentAddress = addresses[activeNetwork] || '';

  const handleCopy = () => {
    if (!currentAddress) return;
    navigator.clipboard.writeText(currentAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getPageTitle = () => {
    if (pathname.includes('/dashboard')) return 'Dashboard';
    if (pathname.includes('/history')) return 'Historial';
    if (pathname.includes('/settings')) return 'Configuración';
    return 'Mi Wallet';
  };

  return (
    <header className="w-full bg-bg-primary border-b border-border px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold font-sans text-text-primary hidden md:block tracking-tight">
          {getPageTitle()}
        </h1>
        {currentAddress && (
          <div 
            onClick={handleCopy}
            title="Copiar dirección"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-bg-secondary border border-border cursor-pointer hover:bg-bg-tertiary hover:border-border-hover transition-all duration-200 select-none max-w-[160px] md:max-w-none shadow-xs"
          >
            <span className="font-mono text-xs text-text-secondary truncate">
              {currentAddress}
            </span>
            {copied ? (
              <Check size={12} className="text-success shrink-0" />
            ) : (
              <Copy size={12} className="text-text-tertiary shrink-0" />
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Network Selector */}
        <NetworkSelector />

        {/* Alerts & Notifications (Mock) */}
        <button 
          aria-label="Notificaciones"
          className="p-2 rounded-lg hover:bg-bg-secondary text-text-secondary hover:text-text-primary transition-colors duration-200 relative shrink-0 border border-transparent hover:border-border"
        >
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent-secondary" />
        </button>
      </div>
    </header>
  );
}
