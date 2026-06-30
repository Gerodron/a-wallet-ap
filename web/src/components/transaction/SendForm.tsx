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

  const renderStepIndicator = () => {
    const getStepDotClass = (current: number) => {
      const isCompleted = step > current;
      const isActive = step === current;
      if (isCompleted) return 'border-success bg-success text-white';
      if (isActive) return 'border-accent-secondary text-accent-secondary shadow-xs';
      return 'border-slate-200 text-slate-400 bg-bg-primary';
    };

    return (
      <div className="mb-6 px-1">
        <div className="relative flex items-center justify-between w-full before:content-[''] before:absolute before:h-[2px] before:bg-slate-200 before:top-1/2 before:left-0 before:right-0 before:-translate-y-1/2 before:z-1">
          {/* Progress bar line */}
          <div 
            className="absolute h-[2px] bg-accent-secondary top-1/2 -translate-y-1/2 z-1 transition-all duration-300" 
            style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}
          />
          {/* Step 1 */}
          <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-extrabold relative z-2 transition-all duration-300 ${getStepDotClass(1)}`}>
            {step > 1 ? <Check size={14} className="stroke-[3]" /> : '1'}
          </div>
          {/* Step 2 */}
          <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-extrabold relative z-2 transition-all duration-300 ${getStepDotClass(2)}`}>
            {step > 2 ? <Check size={14} className="stroke-[3]" /> : '2'}
          </div>
          {/* Step 3 */}
          <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-extrabold relative z-2 transition-all duration-300 ${getStepDotClass(3)}`}>
            {step > 3 ? <Check size={14} className="stroke-[3]" /> : '3'}
          </div>
        </div>
        <div className="flex justify-between text-[9px] text-text-tertiary font-bold uppercase tracking-wider mt-2.5 px-0.5 select-none">
          <span>Detalles</span>
          <span className="text-center -mr-2">Confirmar</span>
          <span>Éxito</span>
        </div>
      </div>
    );
  };

  return (
    <Card className="max-w-md mx-auto border border-border bg-bg-primary shadow-md p-6 md:p-8">
      {renderStepIndicator()}

      {step === 1 && (
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-2 mb-1">
            <Send size={18} className="text-accent-primary shrink-0" />
            <h2 className="text-lg font-bold text-accent-primary">Enviar {activeConfig.symbol}</h2>
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
              rightElement={<span className="text-xs text-text-secondary pr-1.5 font-bold">{activeConfig.symbol}</span>}
            />
            <div className="flex items-center justify-between text-[11px] text-text-secondary mt-1 px-0.5">
              <span className="font-medium">Disponible: {balance.toFixed(4)} {activeConfig.symbol}</span>
              <button 
                onClick={() => setAmount(balance.toString())}
                className="text-accent-secondary font-bold hover:underline cursor-pointer"
              >
                Máx
              </button>
            </div>
          </div>

          {error && recipient !== '' && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-error-dim border border-error/15 text-error text-xs font-semibold">
              <AlertTriangle size={14} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <Button onClick={handleNext} fullWidth className="shadow-xs">
            Continuar
          </Button>
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col gap-6">
          <h2 className="text-lg font-bold text-accent-primary text-center tracking-tight">Confirmar Envío</h2>
          
          <div className="p-5 rounded-xl bg-bg-secondary border border-border flex flex-col gap-3.5 shadow-xs">
            <div className="flex items-center justify-between border-b border-border pb-2.5">
              <span className="text-xs text-text-secondary font-semibold">Monto</span>
              <span className="text-sm font-extrabold text-accent-primary">{amount} {activeConfig.symbol}</span>
            </div>
            <div className="flex items-center justify-between border-b border-border pb-2.5">
              <span className="text-xs text-text-secondary font-semibold">Red</span>
              <span className="text-xs font-bold text-text-primary">{activeConfig.name}</span>
            </div>
            <div className="flex flex-col gap-1 border-b border-border pb-2.5">
              <span className="text-xs text-text-secondary font-semibold">Destinatario</span>
              <span className="font-mono text-xs text-text-primary break-all leading-relaxed bg-bg-primary p-2.5 rounded-lg border border-border">{recipient}</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-text-secondary font-medium">
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
            className="text-center tracking-[0.5em] font-bold"
          />

          {error && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-error-dim border border-error/15 text-error text-xs font-semibold">
              <AlertTriangle size={14} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setStep(1)} fullWidth>
              Atrás
            </Button>
            <Button onClick={handleSend} isLoading={loading} fullWidth className="shadow-xs">
              Autorizar y Enviar
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col items-center justify-center text-center p-4 gap-5 animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-success-dim border border-success/30 flex items-center justify-center text-success shadow-sm">
            <Check size={32} className="stroke-[3]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-accent-primary tracking-tight">¡Transacción Enviada!</h2>
            <p className="text-xs text-text-secondary mt-1 font-medium">El broadcast se ha realizado exitosamente.</p>
          </div>

          <div className="w-full p-4 rounded-xl bg-bg-secondary border border-border text-left shadow-xs">
            <span className="text-[10px] text-text-secondary block font-bold uppercase tracking-wider">Tx Hash</span>
            <span className="font-mono text-xs text-text-primary break-all block mt-1.5 leading-relaxed bg-bg-primary p-2.5 rounded-lg border border-border">{txHash}</span>
          </div>

          <Button onClick={() => { setStep(1); setAmount(''); setRecipient(''); setPin(''); }} fullWidth className="shadow-xs">
            Nueva Transferencia
          </Button>
        </div>
      )}
    </Card>
  );
}
