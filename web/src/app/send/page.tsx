'use client';

import React from 'react';
import { SendForm } from '@/components/transaction/SendForm';

export default function SendPage() {
  return (
    <div className="flex flex-col gap-6 py-4">
      <div>
        <h2 className="text-xl font-bold text-text-primary">Enviar Fondos</h2>
        <p className="text-xs text-text-secondary mt-0.5">Transfiere activos criptográficos a otra dirección externa de forma descentralizada.</p>
      </div>
      <SendForm />
    </div>
  );
}
