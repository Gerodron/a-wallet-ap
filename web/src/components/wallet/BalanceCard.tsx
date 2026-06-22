'use client';

import React from 'react';
import { useWallet } from '@/lib/hooks/useWallet';
import { Card } from '@/components/ui';
import { Eye, EyeOff, TrendingUp, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import Link from 'next/link';

export function BalanceCard() {
  const { totalValueUSD, isBalanceHidden, toggleBalanceVisibility, activeNetwork, balances } = useWallet();

  const activeBalance = balances[activeNetwork];
  const nativeValue = activeBalance?.native || 0;
  const symbol = activeBalance?.nativeSymbol || 'SOL';

  // Format currency securely
  const formatVal = (val: number) => {
    return val.toLocaleString('es-US', { style: 'currency', currency: 'USD' });
  };

  return (
    <Card variant="accent" padding="lg" className="balance-gradient-bg relative">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col" id="tour-step-balance">
            <span className="text-xs text-text-secondary font-sans font-semibold uppercase tracking-wider">
              Balance General Estimado
            </span>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-3xl md:text-4xl font-bold font-sans tracking-tight text-text-primary">
                {isBalanceHidden ? '••••••' : formatVal(totalValueUSD)}
              </span>
              <button 
                onClick={toggleBalanceVisibility}
                className="btn-ghost p-1.5 rounded-lg text-text-secondary hover:text-text-primary transition-colors"
                aria-label={isBalanceHidden ? "Show balance" : "Hide balance"}
              >
                {isBalanceHidden ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-success/15 border border-success/30 text-success text-xs font-semibold">
            <TrendingUp size={14} />
            <span>+2.45% (24h)</span>
          </div>
        </div>

        <div className="border-t border-border/50 pt-4 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] text-text-secondary uppercase tracking-widest font-semibold">
              Balance de Red Activa
            </span>
            <span className="text-lg font-bold font-sans text-text-primary mt-0.5">
              {isBalanceHidden ? '••••••' : `${nativeValue.toFixed(4)} ${symbol}`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/send" id="tour-step-send" className="btn-primary py-2 px-4 rounded-xl flex items-center gap-1.5 text-xs text-white">
              <ArrowUpRight size={14} />
              <span>Enviar</span>
            </Link>
            <Link href="/receive" id="tour-step-receive" className="btn-secondary py-2 px-4 rounded-xl flex items-center gap-1.5 text-xs">
              <ArrowDownLeft size={14} />
              <span>Recibir</span>
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
}
