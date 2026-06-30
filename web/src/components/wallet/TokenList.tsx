'use client';

import React from 'react';
import { Token } from '@/lib/types/wallet';
import { NETWORK_CONFIGS } from '@/lib/types/network';
import { Card } from '@/components/ui';
import { Coins, ChevronRight } from 'lucide-react';
import { useWallet } from '@/lib/hooks/useWallet';

interface TokenListProps {
  tokens: Token[];
}

export function TokenList({ tokens }: TokenListProps) {
  const { isBalanceHidden } = useWallet();

  if (tokens.length === 0) {
    return (
      <Card padding="lg" className="flex flex-col items-center justify-center text-center p-8 border border-border bg-bg-primary shadow-xs">
        <Coins size={40} className="text-text-tertiary mb-3 animate-float" />
        <span className="text-text-primary font-bold">No se encontraron tokens</span>
        <span className="text-xs text-text-secondary mt-1 font-medium">Los balances se actualizarán automáticamente.</span>
      </Card>
    );
  }

  return (
    <Card padding="none" className="overflow-hidden border border-border bg-bg-primary shadow-xs">
      <div className="divide-y divide-border">
        {tokens.map((token) => {
          const config = NETWORK_CONFIGS[token.network];
          return (
            <div 
              key={`${token.network}-${token.mint}`}
              className="flex items-center justify-between p-4.5 hover:bg-bg-secondary transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                {/* Logo slot */}
                <div 
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-mono text-base font-bold border shrink-0
                    ${token.network === 'solana' ? 'bg-[#9945FF]/10 border-[#9945FF]/20 text-[#7A22E0]' : token.network === 'bitcoin' ? 'bg-[#F7931A]/10 border-[#F7931A]/20 text-[#C46A00]' : 'bg-[#F0B90B]/10 border-[#F0B90B]/20 text-[#926B00]'}`}
                >
                  <span>{token.symbol.charAt(0)}</span>
                </div>

                <div className="flex flex-col">
                  <span className="font-bold text-sm text-accent-primary tracking-tight">
                    {token.name}
                  </span>
                  <span className="text-xs text-text-secondary font-medium mt-0.5">
                    {token.symbol} en {config.name}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex flex-col items-end">
                  <span className="font-extrabold text-sm text-text-primary font-mono">
                    {isBalanceHidden ? '••••' : token.balance.toFixed(4)}
                  </span>
                  <span className="text-xs text-text-secondary font-mono mt-0.5 font-medium">
                    {isBalanceHidden ? '••••' : `$${token.usdValue.toFixed(2)}`}
                  </span>
                </div>
                <ChevronRight size={16} className="text-text-tertiary" />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
