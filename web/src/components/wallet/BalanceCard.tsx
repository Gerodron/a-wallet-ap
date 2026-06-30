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
    <Card variant="flat" padding="lg" className="bg-accent-primary relative text-white border border-transparent rounded-2xl shadow-xs">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col" id="tour-step-balance">
            <span className="text-[11px] text-blue-100/80 font-bold uppercase tracking-wider">
              Balance General Estimado
            </span>
            <div className="flex items-center gap-3 mt-1.5">
              <span className="text-3xl md:text-4xl font-extrabold font-sans tracking-tight text-white">
                {isBalanceHidden ? '••••••' : formatVal(totalValueUSD)}
              </span>
              <button 
                onClick={toggleBalanceVisibility}
                className="p-1.5 rounded-lg text-blue-100/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                aria-label={isBalanceHidden ? "Mostrar balance" : "Ocultar balance"}
              >
                {isBalanceHidden ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold leading-none">
            <TrendingUp size={12} className="stroke-[2.5]" />
            <span>+2.45%</span>
          </div>
        </div>

        <div className="border-t border-white/10 pt-5 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] text-blue-100/80 uppercase tracking-wider font-bold">
              Balance de Red Activa
            </span>
            <span className="text-lg font-bold font-sans text-white mt-1">
              {isBalanceHidden ? '••••••' : `${nativeValue.toFixed(4)} ${symbol}`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link 
              href="/send" 
              id="tour-step-send" 
              className="py-2.5 px-4.5 rounded-lg flex items-center gap-1.5 text-xs bg-white text-accent-primary hover:bg-blue-50 font-bold transition-all shadow-xs cursor-pointer"
            >
              <ArrowUpRight size={14} className="stroke-[2.5]" />
              <span>Enviar</span>
            </Link>
            <Link 
              href="/receive" 
              id="tour-step-receive" 
              className="py-2.5 px-4.5 rounded-lg flex items-center gap-1.5 text-xs bg-white/10 hover:bg-white/15 text-white border border-white/20 font-bold transition-all cursor-pointer"
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
