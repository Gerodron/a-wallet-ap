'use client';

import React, { useEffect } from 'react';
import { BalanceCard } from '@/components/wallet/BalanceCard';
import { TokenList } from '@/components/wallet/TokenList';
import { Card, Spinner, DashboardTour } from '@/components/ui';
import { useWallet } from '@/lib/hooks/useWallet';
import { useBalance } from '@/lib/hooks/useBalance';
import { TrendingUp, RefreshCw, Layers } from 'lucide-react';

export default function Dashboard() {
  const { tokens, isLoadingBalances, refreshBalances, activeNetwork, addresses } = useWallet();

  const address = addresses[activeNetwork] || '';
  const { refetch, isLoading: isRefetching } = useBalance(activeNetwork, address);

  const handleRefresh = async () => {
    await refreshBalances();
    refetch();
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-end">

        <button 
          onClick={handleRefresh}
          className="btn-secondary py-1.5 px-3.5 rounded-lg flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-primary select-none shrink-0 cursor-pointer hover:bg-bg-tertiary transition-all"
          disabled={isLoadingBalances || isRefetching}
        >
          <RefreshCw size={12} className={isLoadingBalances || isRefetching ? 'animate-spin' : ''} />
          <span>Actualizar</span>
        </button>
      </div>

      <BalanceCard />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="flex items-center gap-4 border border-border bg-bg-primary shadow-xs">
          <div className="p-3 rounded-xl bg-accent-light text-accent-primary">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-.778.099-1.533.284-2.253" />
            </svg>
          </div>
          <div>
            <span className="block text-[11px] font-bold text-text-secondary leading-none">Red Activa</span>
            <span className="text-sm font-extrabold text-accent-primary mt-1 block leading-tight">
              {activeNetwork === 'solana' ? 'Solana Devnet' : activeNetwork === 'bitcoin' ? 'Bitcoin Testnet' : 'BNB Smart Chain'}
            </span>
          </div>
        </Card>

        <Card className="flex items-center gap-4 border border-border bg-bg-primary shadow-xs">
          <div className="p-3 rounded-xl bg-success-dim text-success border border-[#059669]/10">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
          </div>
          <div>
            <span className="block text-[11px] font-bold text-text-secondary leading-none">Seguridad</span>
            <span className="text-sm font-extrabold text-accent-primary mt-1 block leading-tight">Local Protegido</span>
          </div>
        </Card>

        <Card className="flex items-center gap-4 border border-border bg-bg-primary shadow-xs">
          <div className="p-3 rounded-xl bg-warning-dim text-warning border border-[#D97706]/10">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.214.11a1.986 1.986 0 002.114-.165c.55-.417.872-1.074.872-1.768v-3.07c0-.694-.322-1.35-.872-1.768a1.986 1.986 0 00-2.114-.165l-.214.112M15 11.818l-.214-.11a1.986 1.986 0 00-2.114.165c-.55.417-.872 1.074-.872 1.768v3.07c0 .694.322 1.35.872 1.768a1.986 1.986 0 002.114.165l.214-.112M12 3v1.5m0 15V21m-9-9h1.5m15 0H21" />
            </svg>
          </div>
          <div>
            <span className="block text-[11px] font-bold text-text-secondary leading-none">Total Activos</span>
            <span className="text-sm font-extrabold text-accent-primary mt-1 block leading-tight">{tokens.length} Monedas</span>
          </div>
        </Card>
      </div>

      <div id="tour-step-history" className="flex flex-col gap-3 transition-all duration-300">
        <div className="flex items-center gap-2 px-1">
          <Layers size={14} className="text-text-secondary" />
          <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider">
            Tokens & Activos
          </h3>
        </div>

        {isLoadingBalances ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size={32} />
          </div>
        ) : (
          <TokenList tokens={tokens} />
        )}
      </div>

      <DashboardTour />
    </div>
  );
}
