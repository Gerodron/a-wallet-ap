'use client';

import React from 'react';
import { useWallet } from '@/lib/hooks/useWallet';
import { Card } from '@/components/ui';
import { Eye, EyeOff, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import Link from 'next/link';

export function BalanceCard() {
  const {
    totalValueUSD,
    isBalanceHidden,
    toggleBalanceVisibility,
    activeNetwork,
    balances,
    isLoadingBalances
  } = useWallet();

  // ---------------------------------------------------------------------------
  // Early return for Loading State (Flattened skeleton)
  // ---------------------------------------------------------------------------
  if (isLoadingBalances) {
    return (
      <div
        className="relative rounded-2xl p-6 overflow-hidden"
        style={{ backgroundColor: '#002855' }}
      >
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.8s ease-in-out infinite',
          }}
        />
        <div className="flex flex-col gap-6">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-2">
              <div className="h-2.5 w-36 rounded bg-white/20" />
              <div className="h-8 w-44 rounded-lg bg-white/20 mt-1" />
            </div>
            <div className="h-6 w-14 rounded-full bg-white/20" />
          </div>
          <div className="border-t border-white/10 pt-5 flex items-center justify-between">
            <div className="flex flex-col gap-1.5">
              <div className="h-2 w-24 rounded bg-white/20" />
              <div className="h-5 w-28 rounded bg-white/20 mt-0.5" />
            </div>
            <div className="flex gap-2">
              <div className="h-9 w-20 rounded-lg bg-white/20" />
              <div className="h-9 w-20 rounded-lg bg-white/15" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Data State
  // ---------------------------------------------------------------------------
  const activeBalance = balances[activeNetwork];
  const nativeValue  = activeBalance?.native || 0;
  const symbol       = activeBalance?.nativeSymbol || 'SOL';

  const formatUSD = (val: number) =>
    val.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

  return (
    <Card
      variant="flat"
      padding="lg"
      className="relative text-white border border-transparent rounded-2xl shadow-md overflow-hidden transition-all duration-300"
      style={{ backgroundColor: '#002855' }}
    >
      {/* subtle gradient sheen */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          background: 'radial-gradient(ellipse at 70% 20%, rgba(255,255,255,0.8) 0%, transparent 70%)',
        }}
      />

      <div className="relative flex flex-col gap-6">
        {/* Top row */}
        <div className="flex items-start justify-between">
          <div className="flex flex-col" id="tour-step-balance">
            <span className="text-[11px] text-blue-100/75 font-semibold uppercase tracking-widest select-none">
              Balance General Estimado
            </span>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-3xl md:text-4xl font-extrabold font-sans tracking-tight text-white leading-none">
                {isBalanceHidden ? '••••••' : formatUSD(totalValueUSD)}
              </span>
              <button
                onClick={toggleBalanceVisibility}
                className="p-1.5 rounded-lg text-blue-200/60 hover:text-white hover:bg-white/10 transition-all duration-200 cursor-pointer"
                aria-label={isBalanceHidden ? 'Mostrar balance' : 'Ocultar balance'}
              >
                {isBalanceHidden ? <Eye size={17} /> : <EyeOff size={17} />}
              </button>
            </div>
          </div>

          {/* Network badge */}
          <span className="text-[10px] font-bold text-blue-100/60 uppercase tracking-wider px-2.5 py-1 rounded-full border border-white/10 bg-white/5 select-none whitespace-nowrap">
            {activeNetwork === 'solana' ? 'Solana' : activeNetwork === 'bitcoin' ? 'Bitcoin' : 'BNB Chain'}
          </span>
        </div>

        {/* Bottom row */}
        <div className="border-t border-white/10 pt-5 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] text-blue-100/70 uppercase tracking-wider font-semibold select-none">
              Red Activa
            </span>
            <span className="text-lg font-bold font-sans text-white mt-1 leading-none">
              {isBalanceHidden ? '••••••' : `${nativeValue.toFixed(4)} ${symbol}`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/send"
              id="tour-step-send"
              className="py-2 px-4 rounded-lg flex items-center gap-1.5 text-xs bg-white text-accent-primary font-bold transition-all duration-200 hover:bg-blue-50 hover:scale-[1.03] active:scale-[0.97] shadow-sm cursor-pointer"
            >
              <ArrowUpRight size={14} className="stroke-[2.5]" />
              <span>Enviar</span>
            </Link>
            <Link
              href="/receive"
              id="tour-step-receive"
              className="py-2 px-4 rounded-lg flex items-center gap-1.5 text-xs bg-white/12 hover:bg-white/22 text-white border border-white/30 font-bold transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] cursor-pointer"
            >
              <ArrowDownLeft size={14} className="stroke-[2.5]" />
              <span>Recibir</span>
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
}
