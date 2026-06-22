'use client';

import React from 'react';
import { ReceivePanel } from '@/components/transaction/ReceivePanel';

export default function ReceivePage() {
  return (
    <div className="flex flex-col gap-6 py-4">
      <div>
        <h2 className="text-xl font-bold text-text-primary">Recibir Fondos</h2>
        <p className="text-xs text-text-secondary mt-0.5">Recibe activos utilizando un código QR o copiando tu dirección de red.</p>
      </div>
      <ReceivePanel />
    </div>
  );
}
