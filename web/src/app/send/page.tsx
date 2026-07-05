'use client';

import React, { useState, useCallback } from 'react';
import { useWallet } from '@/lib/hooks/useWallet';
import { Card, Button, Input } from '@/components/ui';
import { validateAddress } from '@/lib/crypto/address-validator';
import { Send, AlertTriangle, Check, Copy, ShieldCheck, ArrowRight, ExternalLink } from 'lucide-react';
import { NETWORK_CONFIGS } from '@/lib/types/network';
import { financeService } from '@/lib/api/financeService';

const formatTruncatedString = (str: string, front = 8, back = 6) =>
  str.length > front + back + 4 ? `${str.slice(0, front)}...${str.slice(-back)}` : str;

export default function SendPage() {
  const { activeNetwork, balances, addresses } = useWallet();
  const currentNetworkConfig = NETWORK_CONFIGS[activeNetwork];
  
  const [recipientAddress, setRecipientAddress] = useState('');
  const [sendAmount, setSendAmount]             = useState('');
  const [securityPin, setSecurityPin]           = useState('');
  const [currentStep, setCurrentStep]           = useState<1 | 2 | 3>(1);
  const [errorMessage, setErrorMessage]         = useState('');
  const [transactionHash, setTransactionHash]   = useState('');
  const [isProcessing, setIsProcessing]         = useState(false);
  const [isCopied, setIsCopied]                 = useState(false);

  const availableBalance = balances[activeNetwork]?.native || 0;
  const estimatedFee     = currentNetworkConfig.symbol === 'BTC' ? '0.00025' : currentNetworkConfig.symbol === 'BNB' ? '0.0012' : '0.000005';
  const totalEstimated   = (parseFloat(sendAmount || '0') + parseFloat(estimatedFee)).toFixed(6);

  const handleValidateForm = () => {
    setErrorMessage('');
    
    if (!recipientAddress) {
      return setErrorMessage('Ingresa la dirección de destino.');
    }
    if (!validateAddress(recipientAddress, activeNetwork)) {
      return setErrorMessage(`Dirección inválida para la red ${currentNetworkConfig.name}.`);
    }
    
    const parsedAmount = parseFloat(sendAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return setErrorMessage('Monto inválido.');
    }
    if (parsedAmount > availableBalance) {
      return setErrorMessage('Saldo insuficiente.');
    }
    
    setCurrentStep(2);
  };

  const handleConfirmTransfer = useCallback(async () => {
    setErrorMessage('');
    
    if (securityPin.length < 6) {
      return setErrorMessage('El PIN debe tener exactamente 6 dígitos.');
    }
    
    setIsProcessing(true);
    try {
      const response = await financeService.transfer({
        fromAddress: addresses[activeNetwork] || '',
        toAddress: recipientAddress,
        amount: parseFloat(sendAmount),
        network: activeNetwork,
        pin: securityPin,
      });
      
      setTransactionHash(response.txHash);
      setCurrentStep(3);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Error al procesar la transferencia.');
    } finally {
      setIsProcessing(false);
    }
  }, [addresses, activeNetwork, recipientAddress, sendAmount, securityPin]);

  const handleResetForm = () => {
    setCurrentStep(1);
    setSendAmount('');
    setRecipientAddress('');
    setSecurityPin('');
    setErrorMessage('');
    setTransactionHash('');
  };

  const handleCopyHash = () => {
    navigator.clipboard.writeText(transactionHash);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const getStepIndicatorClass = (stepNumber: number) => {
    if (currentStep > stepNumber) return 'border-emerald-500 bg-emerald-500 text-white';
    if (currentStep === stepNumber) return 'border-accent-secondary text-accent-secondary shadow-xs bg-bg-primary';
    return 'border-border text-text-tertiary bg-bg-primary';
  };

  return (
    <div className="flex flex-col gap-6 py-4">
      <div>
        <h2 className="text-xl font-bold text-text-primary">Enviar Fondos</h2>
        <p className="text-xs text-text-secondary mt-0.5">
          Transfiere activos criptográficos a otra dirección externa de forma descentralizada.
        </p>
      </div>

      <Card className="max-w-md mx-auto border border-border bg-bg-primary shadow-xs p-6 md:p-8">
        
        {currentStep !== 3 && (
          <div className="mb-6 px-1 animate-fade-in">
            <div className="relative flex items-center justify-between w-full">
              <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[2px] bg-border z-0" />
              <div
                className="absolute left-0 top-1/2 -translate-y-1/2 h-[2px] bg-accent-secondary z-0 transition-all duration-500 ease-in-out"
                style={{ width: currentStep === 1 ? '0%' : '50%' }}
              />
              {[1, 2, 3].map((stepNumber) => (
                <div key={stepNumber} className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-extrabold relative z-10 transition-all duration-300 ${getStepIndicatorClass(stepNumber)}`}>
                  {currentStep > stepNumber ? <Check size={13} className="stroke-[3]" /> : stepNumber}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-[9px] text-text-tertiary font-bold uppercase tracking-wider mt-2.5 px-0.5 select-none">
              <span className={currentStep === 1 ? 'text-accent-secondary' : ''}>Detalles</span>
              <span className={currentStep === 2 ? 'text-accent-secondary' : ''}>Confirmar</span>
              <span>Listo</span>
            </div>
          </div>
        )}

        {currentStep === 1 && (
          <div className="flex flex-col gap-5 animate-fade-in">
            <div className="flex items-center gap-2.5 pb-2 border-b border-border">
              <Send size={17} className="text-accent-primary shrink-0" />
              <h2 className="text-lg font-bold text-accent-primary">Enviar {currentNetworkConfig.symbol}</h2>
            </div>

            <div className="flex flex-col gap-4">
              <Input
                label="Dirección de Destino"
                placeholder={`Dirección válida de ${currentNetworkConfig.name}`}
                value={recipientAddress}
                onChange={(e) => { setRecipientAddress(e.target.value); setErrorMessage(''); }}
              />

              <div>
                <Input
                  label="Monto"
                  type="number"
                  placeholder="0.00"
                  value={sendAmount}
                  onChange={(e) => { setSendAmount(e.target.value); setErrorMessage(''); }}
                  rightElement={
                    <span className="text-xs text-text-secondary font-bold pr-1">{currentNetworkConfig.symbol}</span>
                  }
                />
                <div className="flex items-center justify-between text-[11px] text-text-secondary mt-1.5 px-0.5">
                  <span className="font-medium">
                    Disponible: <span className="font-bold text-text-primary">{availableBalance.toFixed(4)} {currentNetworkConfig.symbol}</span>
                  </span>
                  <button
                    onClick={() => setSendAmount(availableBalance.toString())}
                    className="text-accent-secondary font-bold hover:text-accent-primary hover:underline transition-colors cursor-pointer"
                  >
                    Máx
                  </button>
                </div>
              </div>
            </div>

            {errorMessage && (
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-error-dim border border-error/15 text-error text-xs font-semibold animate-fade-in">
                <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <Button onClick={handleValidateForm} fullWidth className="py-3 shadow-sm">
              Continuar
            </Button>
          </div>
        )}

        {currentStep === 3 && (
          <div className="flex flex-col items-center text-center gap-6 py-4 animate-fade-in">
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
              <div className="absolute inset-0 rounded-full border-2 border-emerald-400/30 animate-ping" style={{ animationDuration: '1.5s', animationIterationCount: 2 }} />
            </div>

            <div>
              <h2 className="text-2xl font-extrabold text-accent-primary tracking-tight">¡Transferencia Enviada!</h2>
              <p className="text-sm text-text-secondary mt-1.5 font-medium">
                {sendAmount} {currentNetworkConfig.symbol} enviados exitosamente
              </p>
              <p className="text-xs text-text-tertiary mt-0.5 font-mono">{formatTruncatedString(recipientAddress)}</p>
            </div>

            <div className="w-full rounded-xl bg-bg-secondary border border-border text-left p-4">
              <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest mb-2">Identificador de Transacción</p>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-text-primary break-all leading-relaxed flex-1 bg-bg-primary p-2.5 rounded-lg border border-border">
                  {transactionHash}
                </span>
                <button
                  onClick={handleCopyHash}
                  className="p-2 rounded-lg border border-border bg-bg-primary hover:bg-bg-tertiary text-text-tertiary hover:text-text-primary transition-all duration-200 shrink-0"
                  title="Copiar hash"
                >
                  {isCopied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 w-full">
              <a
                href={`${currentNetworkConfig.explorerUrl}/tx/${transactionHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg border border-border bg-bg-secondary text-text-secondary text-sm font-semibold hover:bg-bg-tertiary hover:text-text-primary transition-all duration-200"
              >
                <ExternalLink size={14} />
                Ver en Explorador de Red
              </a>
              <Button onClick={handleResetForm} fullWidth className="py-3 shadow-sm">
                <ArrowRight size={15} />
                Nueva Transferencia
              </Button>
            </div>
          </div>
        )}
      </Card>

      {currentStep === 2 && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-bg-primary sm:bg-black/40 sm:backdrop-blur-sm transition-all duration-300">
          
          <div 
            className="hidden sm:block absolute inset-0 z-0" 
            onClick={() => { setCurrentStep(1); setErrorMessage(''); }} 
          />

          <div className="relative z-10 w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-md animate-slide-up flex flex-col bg-bg-primary sm:rounded-3xl sm:border border-border sm:shadow-2xl overflow-hidden">
            <div className="flex-1 px-6 py-10 sm:p-8 flex flex-col gap-6 overflow-y-auto no-scrollbar">
              <div className="text-center">
                <p className="text-[11px] font-bold uppercase tracking-widest text-text-tertiary select-none">Confirmar Operación</p>
                <p className="text-sm text-text-secondary mt-1.5">Revisa los detalles antes de autorizar</p>
              </div>

              <div className="flex flex-col items-center gap-2 py-8 border-y border-border px-4">
                <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">Vas a enviar</p>
                <p className="text-5xl font-extrabold text-accent-primary tracking-tight text-center break-words w-full">
                  {sendAmount} <span className="text-3xl font-bold">{currentNetworkConfig.symbol}</span>
                </p>
                <p className="text-sm text-text-secondary font-medium capitalize">{currentNetworkConfig.name}</p>
              </div>

              <div className="flex flex-col rounded-2xl border border-border overflow-hidden bg-bg-secondary shadow-sm">
                <div className="flex items-start justify-between px-5 py-4 border-b border-border gap-4">
                  <span className="text-xs font-semibold text-text-secondary shrink-0 pt-0.5">Destinatario</span>
                  <span className="font-mono text-xs text-text-primary break-all text-right leading-relaxed min-w-0">
                    {recipientAddress}
                  </span>
                </div>
                <div className="flex items-center justify-between px-5 py-4 border-b border-border gap-4">
                  <span className="text-xs font-semibold text-text-secondary shrink-0">Comisión de red</span>
                  <span className="text-xs font-semibold text-text-secondary text-right truncate min-w-0">
                    ~{estimatedFee} {currentNetworkConfig.symbol}
                  </span>
                </div>
                <div className="flex items-center justify-between px-5 py-4 gap-4">
                  <span className="text-xs font-semibold text-text-secondary shrink-0">Total estimado</span>
                  <span className="text-sm font-bold text-accent-primary text-right truncate min-w-0">
                    ≈ {totalEstimated} {currentNetworkConfig.symbol}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2 mt-2">
                <div className="flex items-center gap-1.5 mb-1">
                  <ShieldCheck size={14} className="text-accent-secondary" />
                  <span className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">Autorización PIN</span>
                </div>
                <Input
                  type="password"
                  placeholder="• • • • • •"
                  value={securityPin}
                  onChange={(e) => { setSecurityPin(e.target.value.replace(/\D/g, '').slice(0, 6)); setErrorMessage(''); }}
                  maxLength={6}
                  className="text-center tracking-[0.6em] font-extrabold text-xl py-4 focus:ring-2 focus:ring-accent-secondary/20 bg-bg-primary shadow-sm"
                  inputMode="numeric"
                  autoFocus
                />
              </div>

              {errorMessage && (
                <div className="flex items-start gap-2.5 p-4 rounded-xl bg-error-dim border border-error/15 text-error text-sm font-semibold animate-fade-in">
                  <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 mt-auto pt-6">
                <Button variant="secondary" onClick={() => { setCurrentStep(1); setErrorMessage(''); }} className="w-full sm:flex-1 py-4 text-sm font-bold shadow-sm">
                  Cancelar
                </Button>
                <Button
                  onClick={handleConfirmTransfer}
                  isLoading={isProcessing}
                  disabled={securityPin.length < 6}
                  className="w-full sm:flex-1 py-4 text-sm font-bold bg-accent-primary hover:bg-[#001C3D] disabled:opacity-40 shadow-sm"
                >
                  {!isProcessing && <ShieldCheck size={16} />}
                  Confirmar Envío
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
