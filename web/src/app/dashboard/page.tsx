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
      {/* Portfolio Overview */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-text-primary tracking-wide">Mi Portafolio</h2>
          <p className="text-xs text-text-secondary mt-0.5">Resumen unificado de tus saldos</p>
        </div>
        <button 
          onClick={handleRefresh}
          className="btn-secondary py-1.5 px-3 rounded-lg flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-primary select-none shrink-0"
          disabled={isLoadingBalances || isRefetching}
        >
          <RefreshCw size={14} className={isLoadingBalances || isRefetching ? 'animate-spin' : ''} />
          <span>Actualizar</span>
        </button>
      </div>

      <BalanceCard />

      {/* Tokens List / Activity Section */}
      <div id="tour-step-history" className="flex flex-col gap-3 transition-all duration-300">
        <div className="flex items-center gap-2 px-1">
          <Layers size={16} className="text-text-secondary" />
          <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest">
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

      {/* Onboarding Tour Component */}
      <DashboardTour />
    </div>
  );
}
