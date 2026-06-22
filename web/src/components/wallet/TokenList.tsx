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
      <Card padding="lg" className="flex flex-col items-center justify-center text-center p-8">
        <Coins size={40} className="text-text-tertiary mb-3 animate-float" />
        <span className="text-text-primary font-medium">No se encontraron tokens</span>
        <span className="text-xs text-text-secondary mt-1">Los balances se actualizarán automáticamente.</span>
      </Card>
    );
  }

  return (
    <Card padding="none" className="overflow-hidden">
      <div className="divide-y divide-border">
        {tokens.map((token, index) => {
          const config = NETWORK_CONFIGS[token.network];
          return (
            <div 
              key={`${token.network}-${token.mint}`}
              className="flex items-center justify-between p-4 hover:bg-bg-tertiary/30 transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                {/* Logo slot */}
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center font-mono text-lg font-bold border"
                  style={{ 
                    backgroundColor: `rgba(${token.network === 'solana' ? '153, 69, 255' : token.network === 'bitcoin' ? '247, 147, 26' : '240, 185, 11'}, 0.1)`,
                    borderColor: config.color 
                  }}
                >
                  <span style={{ color: config.color }}>{token.symbol.charAt(0)}</span>
                </div>

                <div className="flex flex-col">
                  <span className="font-semibold text-sm text-text-primary tracking-wide">
                    {token.name}
                  </span>
                  <span className="text-xs text-text-secondary">
                    {token.symbol} en {config.name}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex flex-col items-end">
                  <span className="font-semibold text-sm text-text-primary font-mono">
                    {isBalanceHidden ? '••••' : token.balance.toFixed(4)}
                  </span>
                  <span className="text-xs text-text-secondary font-mono">
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
