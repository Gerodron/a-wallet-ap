'use client';

import React from 'react';
import { NetworkSelector } from './NetworkSelector';
import { useWallet } from '@/lib/hooks/useWallet';
import { useAuthStore } from '@/lib/store/auth-store';
import { Bell, Copy, Check } from 'lucide-react';
import { useState } from 'react';

export function Header() {
  const { activeNetwork, addresses } = useWallet();
  const { isAuthenticated } = useAuthStore();
  const [copied, setCopied] = useState(false);

  if (!isAuthenticated) return null;

  const currentAddress = addresses[activeNetwork] || '';

  const handleCopy = () => {
    if (!currentAddress) return;
    navigator.clipboard.writeText(currentAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="w-full bg-secondary/80 backdrop-blur-md border-b border-border px-6 py-4 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold font-sans text-text-primary hidden md:block">
          Mi Wallet
        </h1>
        {currentAddress && (
          <div 
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-bg-tertiary/70 border border-border cursor-pointer hover:bg-bg-elevated hover:border-border-hover transition-all duration-200 select-none max-w-[200px] md:max-w-none"
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
        <button className="btn-ghost p-2 rounded-lg relative shrink-0">
          <Bell size={20} className="text-text-secondary hover:text-text-primary transition-colors duration-200" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent-primary animate-pulse" />
        </button>
      </div>
    </header>
  );
}
