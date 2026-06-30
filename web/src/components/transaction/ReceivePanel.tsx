'use client';

import React from 'react';
import { useWallet } from '@/lib/hooks/useWallet';
import { Card, Button } from '@/components/ui';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check, QrCode, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { NETWORK_CONFIGS } from '@/lib/types/network';

export function ReceivePanel() {
  const { activeNetwork, addresses } = useWallet();
  const [copied, setCopied] = useState(false);

  const address = addresses[activeNetwork] || '';
  const activeConfig = NETWORK_CONFIGS[activeNetwork];

  const handleCopy = () => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="max-w-md mx-auto text-center border border-border bg-bg-primary shadow-xs p-6 md:p-8 animate-fade-in">
      <div className="flex flex-col items-center gap-5">
        <div className="flex items-center gap-2.5 justify-center pb-2 border-b border-border w-full">
          <QrCode size={18} className="text-accent-secondary shrink-0" />
          <h2 className="text-lg font-bold text-accent-primary tracking-tight">Recibir {activeConfig.symbol}</h2>
        </div>

        {address ? (
          <div className="p-4 rounded-xl bg-white border border-border shrink-0 shadow-xs my-1">
            <QRCodeSVG value={address} size={160} />
          </div>
        ) : (
          <div className="w-[194px] h-[194px] rounded-xl bg-bg-secondary border border-border animate-shimmer my-1" />
        )}

        <div className="flex flex-col gap-2 w-full my-1">
          <span className="text-[10px] md:text-xs text-text-secondary uppercase tracking-wider font-bold text-left px-0.5">
            Dirección pública de {activeConfig.name}
          </span>
          <div className="p-3.5 rounded-xl bg-bg-secondary border border-border flex items-center justify-between gap-3 w-full shadow-xs">
            <span className="font-mono text-xs text-text-primary font-semibold break-all text-left">
              {address || 'Derivando dirección...'}
            </span>
            <button 
              onClick={handleCopy}
              className="p-2 rounded-lg border border-border bg-bg-primary hover:bg-bg-tertiary text-text-secondary hover:text-text-primary transition-all duration-200 cursor-pointer shrink-0"
              title="Copiar dirección"
            >
              {copied ? <Check size={14} className="text-success stroke-[3]" /> : <Copy size={14} />}
            </button>
          </div>
        </div>

        <div className="p-4 md:p-5 rounded-xl bg-warning-dim border border-warning/15 text-[11px] text-text-secondary leading-relaxed font-semibold text-left flex items-start gap-3 mt-1">
          <AlertTriangle size={18} className="text-warning shrink-0 mt-0.5 animate-pulse" />
          <div className="flex-1">
            <span>Transfiere únicamente {activeConfig.symbol} o tokens asociados a la red de {activeConfig.name} hacia esta dirección. El envío de otros activos resultará en la pérdida permanente de los mismos.</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
