'use client';

import React from 'react';
import { Card } from '@/components/ui';
import {
  ExternalLink,
  ArrowUpRight,
  AlertCircle,
  RefreshCw,
  Inbox,
} from 'lucide-react';
import { useWallet } from '@/lib/hooks/useWallet';
import { useHistorial } from '@/lib/hooks/useHistorial';
import { NETWORK_CONFIGS } from '@/lib/types/network';

export default function HistoryPage() {
  const { activeNetwork } = useWallet();
  const currentNetworkConfig = NETWORK_CONFIGS[activeNetwork];

  const { transactions, isLoading, error, refetch } = useHistorial({
    network: activeNetwork,
  });

  let pageContent = null;

  if (isLoading) {
    pageContent = (
      <div className="divide-y divide-border">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="flex items-center justify-between p-4 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-bg-tertiary shrink-0" />
              <div className="flex flex-col gap-1.5">
                <div className="h-3 w-16 rounded bg-bg-tertiary" />
                <div className="h-2.5 w-24 rounded bg-bg-tertiary" />
              </div>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <div className="h-3 w-20 rounded bg-bg-tertiary" />
              <div className="h-2.5 w-16 rounded bg-bg-tertiary" />
            </div>
          </div>
        ))}
      </div>
    );
  } else if (error) {
    pageContent = (
      <div className="flex flex-col items-center gap-3 py-12 px-6 text-center">
        <div className="p-3 rounded-xl bg-error-dim border border-error/20 text-error">
          <AlertCircle size={24} />
        </div>
        <div>
          <p className="text-sm font-bold text-text-primary">No se pudo cargar el historial</p>
          <p className="text-xs text-text-secondary mt-1">{error}</p>
        </div>
        <button
          onClick={refetch}
          className="mt-1 btn-secondary py-1.5 px-4 rounded-lg text-xs flex items-center gap-1.5"
        >
          <RefreshCw size={12} />
          Reintentar
        </button>
      </div>
    );
  } else if (transactions.length === 0) {
    pageContent = (
      <div className="flex flex-col items-center gap-3 py-14 px-6 text-center">
        <div className="p-4 rounded-2xl bg-bg-secondary border border-border text-text-tertiary">
          <Inbox size={28} />
        </div>
        <div>
          <p className="text-sm font-bold text-text-primary">Sin transacciones aún</p>
          <p className="text-xs text-text-secondary mt-1">
            Tus transferencias en la red {currentNetworkConfig.name} aparecerán aquí.
          </p>
        </div>
      </div>
    );
  } else {
    pageContent = (
      <div className="divide-y divide-border">
        {transactions.map((transaction) => {
          const isSendAction = transaction.tipo === 'send';
          const transactionDate = new Date(transaction.fechaTransaccion);
          
          return (
            <div
              key={transaction.txHash}
              className="tx-row flex items-center justify-between p-4 hover:bg-bg-secondary/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center border shrink-0 ${
                    isSendAction
                      ? 'bg-accent-light border-accent-secondary/20 text-accent-primary'
                      : 'bg-success-dim border-success/20 text-success'
                  }`}
                >
                  <ArrowUpRight size={15} className="stroke-[2.5]" />
                </div>

                <div className="flex flex-col">
                  <span className="font-bold text-sm text-accent-primary capitalize">
                    {isSendAction ? 'Enviado' : 'Recibido'}
                  </span>
                  <span className="text-[11px] text-text-secondary font-semibold mt-0.5 font-sans">
                    {transactionDate.toLocaleString('es-US', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex flex-col items-end">
                  <span
                    className={`font-bold text-sm font-mono ${
                      isSendAction ? 'text-accent-primary' : 'text-success'
                    }`}
                  >
                    {isSendAction ? '-' : '+'}{transaction.monto} {currentNetworkConfig.symbol}
                  </span>
                  <span className="text-[10px] text-text-tertiary font-medium font-mono mt-0.5 capitalize">
                    {transaction.estadoTransaccion} · {transaction.red}
                  </span>
                </div>

                <a
                  href={`${currentNetworkConfig.explorerUrl}/tx/${transaction.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg border border-border bg-bg-primary hover:bg-bg-secondary text-text-tertiary hover:text-text-primary transition-all duration-200 cursor-pointer"
                  title="Ver en explorador"
                >
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 py-4">
      <Card padding="none" className="overflow-hidden border border-border bg-bg-primary shadow-xs">
        <div className="flex items-center justify-between p-4 border-b border-border bg-bg-secondary/40">
          <span className="text-sm font-bold text-text-primary tracking-tight">Movimientos Recientes</span>
          <button
            onClick={refetch}
            disabled={isLoading}
            className="p-2 rounded-lg text-text-tertiary hover:text-accent-primary hover:bg-bg-tertiary transition-all disabled:opacity-50 cursor-pointer"
            title="Actualizar historial"
          >
            <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
        {pageContent}
      </Card>
    </div>
  );
}
