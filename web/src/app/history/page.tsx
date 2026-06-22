'use client';

import React from 'react';
import { Card } from '@/components/ui';
import { History, ExternalLink, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { useWallet } from '@/lib/hooks/useWallet';
import { NETWORK_CONFIGS } from '@/lib/types/network';

export default function HistoryPage() {
  const { activeNetwork } = useWallet();

  const activeConfig = NETWORK_CONFIGS[activeNetwork];

  // Mock transaction list matching endpoint spec (5.2)
  const mockTransactions = [
    {
      hash: '3zL2r7Y6V5t4e3w2q1u0p9o8i7u6y5t4r3e2w1q5A7k9XmN4pQW',
      amount: 14.50,
      asset: activeConfig.symbol,
      fee: 0.000005,
      status: 'confirmed',
      type: 'receive',
      from: 'G7z8vM2N7A9xPQK2B8zLp7Y6R5t4e3w2q1u3a9f0e1d',
      to: 'H7t8vM2N7A9xPQK2B8zLp7Y6R5t4e3w2q1u3a9f0e1d',
      timestamp: '2026-06-14T18:22:11Z'
    },
    {
      hash: '9o8i7u6y5t4r3e2w1q5A7k9XmN4pQW3zL2r7Y6V5t4e3w2q1u0p',
      amount: 1.25,
      asset: activeConfig.symbol,
      fee: 0.000005,
      status: 'confirmed',
      type: 'send',
      from: 'H7t8vM2N7A9xPQK2B8zLp7Y6R5t4e3w2q1u3a9f0e1d',
      to: 'K23xPQK2B8zLp7Y6R5t4e3w2q1u3a9f0e1dG7z8vM2N7A9xP',
      timestamp: '2026-06-13T10:15:30Z'
    }
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <History size={20} className="text-text-secondary" />
        <div>
          <h2 className="text-xl font-bold text-text-primary">Historial de Transacciones</h2>
          <p className="text-xs text-text-secondary mt-0.5">Registro de operaciones en la red {activeConfig.name}</p>
        </div>
      </div>

      <Card padding="none" className="overflow-hidden">
        <div className="divide-y divide-border">
          {mockTransactions.map((tx) => (
            <div key={tx.hash} className="tx-row flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center border
                  ${tx.type === 'receive' ? 'bg-success-dim border-success/30 text-success' : 'bg-accent-primary/10 border-accent-primary/30 text-accent-primary'}`}
                >
                  {tx.type === 'receive' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                </div>

                <div className="flex flex-col">
                  <span className="font-semibold text-sm text-text-primary capitalize">
                    {tx.type === 'receive' ? 'Recibido' : 'Enviado'}
                  </span>
                  <span className="text-[11px] text-text-secondary font-mono">
                    {new Date(tx.timestamp).toLocaleString('es-US', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex flex-col items-end">
                  <span className={`font-semibold text-sm font-mono
                    ${tx.type === 'receive' ? 'text-success' : 'text-text-primary'}`}
                  >
                    {tx.type === 'receive' ? '+' : '-'}{tx.amount} {tx.asset}
                  </span>
                  <span className="text-[10px] text-text-tertiary font-mono">
                    Tarifa: {tx.fee} {tx.asset}
                  </span>
                </div>

                <a 
                  href={`${activeConfig.explorerUrl}/tx/${tx.hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-ghost p-1.5 rounded-lg text-text-tertiary hover:text-text-secondary transition-colors"
                >
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
