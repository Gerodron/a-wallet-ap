'use client';

import React, { useState, useCallback } from 'react';
import { useWallet } from '@/lib/hooks/useWallet';
import { Card, Button, Input } from '@/components/ui';
import { validateAddress } from '@/lib/crypto/address-validator';
import { Send, AlertTriangle, Check, Copy, ShieldCheck, ArrowRight, ExternalLink } from 'lucide-react';
import { NETWORK_CONFIGS } from '@/lib/types/network';
import { financeService } from '@/lib/api/financeService';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const truncate = (s: string, front = 8, back = 6) =>
  s.length > front + back + 4 ? `${s.slice(0, front)}...${s.slice(-back)}` : s;

// ---------------------------------------------------------------------------
// Confirmation Bottom-Sheet
// ---------------------------------------------------------------------------
interface ConfirmSheetProps {
  network: string;
  symbol: string;
  amount: string;
  recipient: string;
  fee: string;
  pin: string;
  onPinChange: (v: string) => void;
  error: string;
  loading: boolean;
  onConfirm: () => void;
  onBack: () => void;
  open: boolean;
}

function ConfirmSheet({
  network,
  symbol,
  amount,
  recipient,
  fee,
  pin,
  onPinChange,
  error,
  loading,
  onConfirm,
  onBack,
  open,
}: ConfirmSheetProps) {
  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px] transition-opacity duration-300"
        onClick={onBack}
      />

      {/* Sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center">
        <div className="w-full max-w-md animate-slide-up">
          <div className="bg-bg-primary rounded-t-3xl border border-border border-b-0 shadow-2xl overflow-hidden">
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-border" />
            </div>

            <div className="px-6 pb-8 pt-4 flex flex-col gap-5">
              {/* Header */}
              <div className="text-center">
                <p className="text-[11px] font-bold uppercase tracking-widest text-text-tertiary select-none">Confirmar Operación</p>
                <p className="text-xs text-text-secondary mt-1">Revisa los detalles antes de autorizar</p>
              </div>

              {/* Amount hero */}
              <div className="flex flex-col items-center gap-0.5 py-4 border-y border-border">
                <p className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wider">Vas a enviar</p>
                <p className="text-4xl font-extrabold text-accent-primary tracking-tight mt-1">
                  {amount} <span className="text-2xl">{symbol}</span>
                </p>
                <p className="text-xs text-text-secondary mt-0.5 font-medium capitalize">{network}</p>
              </div>

              {/* Details table */}
              <div className="flex flex-col gap-0 rounded-xl border border-border overflow-hidden">
                {[
                  {
                    label: 'Destinatario',
                    value: (
                      <span className="font-mono text-[11px] text-text-primary">
                        {truncate(recipient)}
                      </span>
                    ),
                  },
                  {
                    label: 'Comisión de red',
                    value: (
                      <span className="text-[12px] font-semibold text-text-secondary">
                        ~{fee} {symbol}
                      </span>
                    ),
                  },
                  {
                    label: 'Total estimado',
                    value: (
                      <span className="text-[12px] font-bold text-accent-primary">
                        ≈ {(parseFloat(amount) + parseFloat(fee)).toFixed(6)} {symbol}
                      </span>
                    ),
                  },
                ].map(({ label, value }, i) => (
                  <div
                    key={i}
                    className={`flex items-center justify-between px-4 py-3 ${
                      i < 2 ? 'border-b border-border' : ''
                    } bg-bg-secondary`}
                  >
                    <span className="text-[11px] font-semibold text-text-secondary">{label}</span>
                    {value}
                  </div>
                ))}
              </div>

              {/* PIN */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <ShieldCheck size={13} className="text-accent-secondary" />
                  <span className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">Autorización PIN</span>
                </div>
                <Input
                  type="password"
                  placeholder="• • • • • •"
                  value={pin}
                  onChange={(e) => onPinChange(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  className="text-center tracking-[0.6em] font-extrabold text-lg py-3 focus:ring-2 focus:ring-accent-secondary/20"
                  inputMode="numeric"
                  autoFocus
                />
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-error-dim border border-error/15 text-error text-xs font-semibold animate-fade-in">
                  <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <Button variant="secondary" onClick={onBack} className="flex-1 py-3 text-sm">
                  Cancelar
                </Button>
                <Button
                  onClick={onConfirm}
                  isLoading={loading}
                  disabled={pin.length < 6}
                  className="flex-1 py-3 text-sm bg-accent-primary hover:bg-[#001C3D] disabled:opacity-40"
                >
                  {!loading && <ShieldCheck size={15} />}
                  Autorizar y Enviar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Success Screen
// ---------------------------------------------------------------------------
interface SuccessScreenProps {
  txHash: string;
  amount: string;
  symbol: string;
  recipient: string;
  explorerUrl: string;
  onReset: () => void;
}

function SuccessScreen({ txHash, amount, symbol, recipient, explorerUrl, onReset }: SuccessScreenProps) {
  const [copied, setCopied] = useState(false);

  const copyHash = () => {
    navigator.clipboard.writeText(txHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col items-center text-center gap-6 py-4 animate-fade-in">
      {/* Animated check circle */}
      <div className="relative animate-scale-in">
        <div className="w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center shadow-sm">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <polyline
              points="8,21 17,30 32,12"
              stroke="#059669"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="animate-check-draw"
            />
          </svg>
        </div>
        {/* Pulse ring */}
        <div className="absolute inset-0 rounded-full border-2 border-emerald-400/30 animate-ping" style={{ animationDuration: '1.5s', animationIterationCount: 2 }} />
      </div>

      {/* Title */}
      <div>
        <h2 className="text-2xl font-extrabold text-accent-primary tracking-tight">¡Transferencia Enviada!</h2>
        <p className="text-sm text-text-secondary mt-1.5 font-medium">
          {amount} {symbol} enviados exitosamente
        </p>
        <p className="text-xs text-text-tertiary mt-0.5 font-mono">{truncate(recipient)}</p>
      </div>

      {/* TxHash box */}
      <div className="w-full rounded-xl bg-bg-secondary border border-border text-left p-4">
        <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest mb-2">Identificador de Transacción</p>
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-text-primary break-all leading-relaxed flex-1 bg-bg-primary p-2.5 rounded-lg border border-border">
            {txHash}
          </span>
          <button
            onClick={copyHash}
            className="p-2 rounded-lg border border-border bg-bg-primary hover:bg-bg-tertiary text-text-tertiary hover:text-text-primary transition-all duration-200 shrink-0"
            title="Copiar hash"
          >
            {copied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2.5 w-full">
        <a
          href={`${explorerUrl}/tx/${txHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg border border-border bg-bg-secondary text-text-secondary text-sm font-semibold hover:bg-bg-tertiary hover:text-text-primary transition-all duration-200"
        >
          <ExternalLink size={14} />
          Ver en Explorador de Red
        </a>
        <Button
          onClick={onReset}
          fullWidth
          className="py-3 shadow-sm"
        >
          <ArrowRight size={15} />
          Nueva Transferencia
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step indicator
// ---------------------------------------------------------------------------
function StepIndicator({ step }: { step: number }) {
  const getClass = (s: number) => {
    if (step > s) return 'border-emerald-500 bg-emerald-500 text-white';
    if (step === s) return 'border-accent-secondary text-accent-secondary shadow-xs bg-bg-primary';
    return 'border-border text-text-tertiary bg-bg-primary';
  };
  const labels = ['Detalles', 'Confirmar', 'Listo'];

  return (
    <div className="mb-6 px-1">
      <div className="relative flex items-center justify-between w-full">
        {/* Track */}
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[2px] bg-border z-0" />
        {/* Progress */}
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-[2px] bg-accent-secondary z-0 transition-all duration-500 ease-in-out"
          style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}
        />
        {[1, 2, 3].map((s) => (
          <div key={s} className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-extrabold relative z-10 transition-all duration-300 ${getClass(s)}`}>
            {step > s ? <Check size={13} className="stroke-[3]" /> : s}
          </div>
        ))}
      </div>
      <div className="flex justify-between text-[9px] text-text-tertiary font-bold uppercase tracking-wider mt-2.5 px-0.5 select-none">
        {labels.map((l, i) => (
          <span key={i} className={step === i + 1 ? 'text-accent-secondary' : ''}>{l}</span>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main SendForm
// ---------------------------------------------------------------------------
export function SendForm() {
  const { activeNetwork, balances, addresses } = useWallet();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount]       = useState('');
  const [pin, setPin]             = useState('');
  const [step, setStep]           = useState<1 | 2 | 3>(1);
  const [error, setError]         = useState('');
  const [txHash, setTxHash]       = useState('');
  const [loading, setLoading]     = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  const activeConfig = NETWORK_CONFIGS[activeNetwork];
  const balance      = balances[activeNetwork]?.native || 0;
  const fee          = activeConfig.symbol === 'BTC' ? '0.00025' : activeConfig.symbol === 'BNB' ? '0.0012' : '0.000005';

  const handleNext = () => {
    setError('');
    if (!recipient)                          return setError('Ingresa la dirección de destino.');
    if (!validateAddress(recipient, activeNetwork)) return setError(`Dirección inválida para la red ${activeConfig.name}.`);
    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed <= 0)        return setError('Monto inválido.');
    if (parsed > balance)                    return setError('Saldo insuficiente.');
    setStep(2);
    setSheetOpen(true);
  };

  const handleSend = useCallback(async () => {
    setError('');
    if (pin.length < 6) return setError('El PIN debe tener exactamente 6 dígitos.');
    setLoading(true);
    try {
      const response = await financeService.transfer({
        fromAddress: addresses[activeNetwork] || '',
        toAddress: recipient,
        amount: parseFloat(amount),
        network: activeNetwork,
        pin,
      });
      setTxHash(response.txHash);
      setSheetOpen(false);
      // tiny pause so the sheet animates out before the success screen renders
      setTimeout(() => setStep(3), 50);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al procesar la transferencia.');
    } finally {
      setLoading(false);
    }
  }, [addresses, activeNetwork, recipient, amount, pin]);

  const handleReset = () => {
    setStep(1);
    setAmount('');
    setRecipient('');
    setPin('');
    setError('');
    setTxHash('');
    setSheetOpen(false);
  };

  return (
    <>
      <Card className="max-w-md mx-auto border border-border bg-bg-primary shadow-xs p-6 md:p-8">
        {step !== 3 && <StepIndicator step={step} />}

        {/* ── Step 1: Input form ── */}
        {step === 1 && (
          <div className="flex flex-col gap-5 animate-fade-in">
            <div className="flex items-center gap-2.5 pb-2 border-b border-border">
              <Send size={17} className="text-accent-primary shrink-0" />
              <h2 className="text-lg font-bold text-accent-primary">Enviar {activeConfig.symbol}</h2>
            </div>

            <div className="flex flex-col gap-4">
              <Input
                label="Dirección de Destino"
                placeholder={`Dirección válida de ${activeConfig.name}`}
                value={recipient}
                onChange={(e) => { setRecipient(e.target.value); setError(''); }}
              />

              <div>
                <Input
                  label="Monto"
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => { setAmount(e.target.value); setError(''); }}
                  rightElement={
                    <span className="text-xs text-text-secondary font-bold pr-1">{activeConfig.symbol}</span>
                  }
                />
                <div className="flex items-center justify-between text-[11px] text-text-secondary mt-1.5 px-0.5">
                  <span className="font-medium">Disponible: <span className="font-bold text-text-primary">{balance.toFixed(4)} {activeConfig.symbol}</span></span>
                  <button
                    onClick={() => setAmount(balance.toString())}
                    className="text-accent-secondary font-bold hover:text-accent-primary hover:underline transition-colors cursor-pointer"
                  >
                    Máx
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-error-dim border border-error/15 text-error text-xs font-semibold animate-fade-in">
                <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <Button onClick={handleNext} fullWidth className="py-3 shadow-sm">
              Continuar
            </Button>
          </div>
        )}

        {/* ── Step 3: Success ── */}
        {step === 3 && (
          <SuccessScreen
            txHash={txHash}
            amount={amount}
            symbol={activeConfig.symbol}
            recipient={recipient}
            explorerUrl={activeConfig.explorerUrl}
            onReset={handleReset}
          />
        )}
      </Card>

      {/* ── Step 2: Confirmation bottom-sheet ── */}
      <ConfirmSheet
        open={sheetOpen}
        network={activeConfig.name}
        symbol={activeConfig.symbol}
        amount={amount}
        recipient={recipient}
        fee={fee}
        pin={pin}
        onPinChange={(v) => { setPin(v); setError(''); }}
        error={error}
        loading={loading}
        onConfirm={handleSend}
        onBack={() => { setSheetOpen(false); setStep(1); setError(''); }}
      />
    </>
  );
}
