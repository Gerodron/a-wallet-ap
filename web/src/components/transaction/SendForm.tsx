'use client';

import React, { useState } from 'react';
import { useWallet } from '@/lib/hooks/useWallet';
import { Card, Button, Input } from '@/components/ui';
import { validateAddress } from '@/lib/crypto/address-validator';
import { Send, AlertTriangle, ArrowRight, Check } from 'lucide-react';
import { NETWORK_CONFIGS } from '@/lib/types/network';

export function SendForm() {
  const { activeNetwork, balances, addresses } = useWallet();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [pin, setPin] = useState('');
  const [step, setStep] = useState(1); // 1: Input, 2: Confirm, 3: Success
  const [error, setError] = useState('');
  const [txHash, setTxHash] = useState('');
  const [loading, setLoading] = useState(false);

  const activeConfig = NETWORK_CONFIGS[activeNetwork];
  const balance = balances[activeNetwork]?.native || 0;

  const handleNext = () => {
    setError('');
    if (!recipient) {
      setError('Por favor ingrese la dirección de destino');
      return;
    }
    if (!validateAddress(recipient, activeNetwork)) {
      setError(`Dirección inválida para la red ${activeConfig.name}`);
      return;
    }
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Monto inválido');
      return;
    }
    if (parsedAmount > balance) {
      setError('Saldo insuficiente');
      return;
    }
    setStep(2);
  };

  const handleSend = async () => {
    setError('');
    if (pin.length < 6) {
      setError('El PIN debe tener 6 dígitos');
      return;
    }
    setLoading(true);
    try {
      // Mock transaction broadcast
      setTimeout(() => {
        setTxHash('5A7k9XmN4pQW3zL2r7Y6V5t4e3w2q1u0p9o8i7u6y5t4r3e2w1q');
        setLoading(false);
        setStep(3);
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Transmisión de transacción fallida');
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      {step === 1 && (
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-2 mb-2">
            <Send size={18} className="text-accent-primary shrink-0" />
            <h2 className="text-lg font-bold text-text-primary">Enviar {activeConfig.symbol}</h2>
          </div>

          <Input 
            label="Dirección de Destino"
            placeholder={`Dirección de ${activeConfig.name}`}
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            error={error && recipient === '' ? error : undefined}
          />

          <div className="relative">
            <Input 
              label="Monto a Transferir"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              rightElement={<span className="text-xs text-text-secondary pr-4 font-semibold">{activeConfig.symbol}</span>}
            />
            <div className="flex items-center justify-between text-xs text-text-secondary mt-1 px-1">
              <span>Disponible: {balance.toFixed(4)} {activeConfig.symbol}</span>
              <button 
                onClick={() => setAmount(balance.toString())}
                className="text-accent-primary font-semibold hover:underline"
              >
                Máx
              </button>
            </div>
          </div>

          {error && !recipient && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-error-dim border border-error/20 text-error text-xs">
              <AlertTriangle size={14} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <Button onClick={handleNext} fullWidth>
            Continuar
          </Button>
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col gap-6">
          <h2 className="text-lg font-bold text-text-primary text-center">Confirmar Envío</h2>
          
          <div className="p-4 rounded-xl bg-bg-tertiary border border-border flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-border/50 pb-2">
              <span className="text-xs text-text-secondary">Monto</span>
              <span className="text-sm font-bold text-text-primary">{amount} {activeConfig.symbol}</span>
            </div>
            <div className="flex items-center justify-between border-b border-border/50 pb-2">
              <span className="text-xs text-text-secondary">Red</span>
              <span className="text-xs font-semibold text-text-primary">{activeConfig.name}</span>
            </div>
            <div className="flex flex-col gap-1 border-b border-border/50 pb-2">
              <span className="text-xs text-text-secondary">Destinatario</span>
              <span className="font-mono text-xs text-text-primary break-all">{recipient}</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-text-secondary">
              <span>Tarifa de red</span>
              <span>~ 0.000005 {activeConfig.symbol}</span>
            </div>
          </div>

          <Input 
            label="PIN de Acceso"
            type="password"
            placeholder="Ingrese su PIN de 6 dígitos"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
            maxLength={6}
            className="text-center tracking-widest font-bold"
          />

          {error && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-error-dim border border-error/20 text-error text-xs">
              <AlertTriangle size={14} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setStep(1)} fullWidth>
              Atrás
            </Button>
            <Button onClick={handleSend} isLoading={loading} fullWidth>
              Autorizar y Enviar
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col items-center justify-center text-center p-4 gap-5">
          <div className="w-16 h-16 rounded-full bg-success-dim border border-success/30 flex items-center justify-center text-success animate-pulse-glow">
            <Check size={32} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-text-primary">¡Transacción Enviada!</h2>
            <p className="text-xs text-text-secondary mt-1">El broadcast se ha realizado exitosamente.</p>
          </div>

          <div className="w-full p-3 rounded-lg bg-bg-tertiary border border-border text-left">
            <span className="text-[10px] text-text-secondary block font-semibold uppercase">Tx Hash</span>
            <span className="font-mono text-xs text-text-primary break-all block mt-0.5">{txHash}</span>
          </div>

          <Button onClick={() => { setStep(1); setAmount(''); setRecipient(''); setPin(''); }} fullWidth>
            Nueva Transferencia
          </Button>
        </div>
      )}
    </Card>
  );
}
