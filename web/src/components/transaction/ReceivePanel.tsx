'use client';

import React from 'react';
import { useWallet } from '@/lib/hooks/useWallet';
import { Card, Button } from '@/components/ui';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check, QrCode } from 'lucide-react';
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
    <Card className="max-w-md mx-auto text-center">
      <div className="flex flex-col items-center gap-6 py-4">
        <div className="flex items-center gap-2 justify-center mb-1">
          <QrCode size={18} className="text-accent-primary shrink-0 animate-pulse-glow" />
          <h2 className="text-lg font-bold text-text-primary">Recibir {activeConfig.symbol}</h2>
        </div>

        {address ? (
          <div className="p-4 rounded-2xl bg-white border-4 border-accent-primary/20 shrink-0">
            <QRCodeSVG value={address} size={180} />
          </div>
        ) : (
          <div className="w-[180px] h-[180px] rounded-2xl bg-bg-tertiary border border-border animate-shimmer" />
        )}

        <div className="flex flex-col gap-2 w-full">
          <span className="text-xs text-text-secondary uppercase tracking-widest font-semibold">
            Dirección pública de {activeConfig.name}
          </span>
          <div className="p-3.5 rounded-xl bg-bg-tertiary border border-border flex items-center justify-between gap-4">
            <span className="font-mono text-xs text-text-primary break-all text-left">
              {address || 'Derivando dirección...'}
            </span>
            <button 
              onClick={handleCopy}
              className="btn-secondary p-2.5 rounded-lg border border-border shrink-0 hover:bg-bg-elevated"
            >
              {copied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
            </button>
          </div>
        </div>

        <p className="text-[11px] text-text-secondary leading-relaxed px-4">
          Transfiere únicamente {activeConfig.symbol} o tokens asociados a la red de {activeConfig.name} hacia esta dirección. El envío de otros activos resultará en la pérdida permanente de los mismos.
        </p>
      </div>
    </Card>
  );
}
