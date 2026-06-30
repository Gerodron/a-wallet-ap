'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, Input } from '@/components/ui';
import { validateMnemonic, deriveAllWallets } from '@/lib/crypto/wallet-generator';
import { encryptData } from '@/lib/crypto/encryption';
import { useWallet } from '@/lib/hooks/useWallet';
import { useAuthStore } from '@/lib/store/auth-store';
import { KeyRound, ShieldCheck, Check } from 'lucide-react';

export default function ImportWalletPage() {
  const router = useRouter();
  const { setInitialized, setAddresses } = useWallet();
  const { login } = useAuthStore();

  const [step, setStep] = useState(1); // 1: Semilla, 2: PIN, 3: Done
  const [mnemonic, setMnemonic] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerifySeed = () => {
    setError('');
    const cleanedMnemonic = mnemonic.trim().toLowerCase().replace(/\s+/g, ' ');
    if (!validateMnemonic(cleanedMnemonic)) {
      setError('Frase mnemónica inválida. Debe constar de 12 o 24 palabras en inglés.');
      return;
    }
    setMnemonic(cleanedMnemonic);
    setStep(2);
  };

  const handleImport = async () => {
    setError('');
    if (pin.length < 6) {
      setError('El PIN debe tener 6 dígitos');
      return;
    }
    if (pin !== confirmPin) {
      setError('Los PINs no coinciden');
      return;
    }

    setLoading(true);
    try {
      const wallets = await deriveAllWallets(mnemonic);
      const encrypted = await encryptData(mnemonic, pin);

      if (typeof window !== 'undefined') {
        localStorage.setItem('wallet_encrypted_seed', JSON.stringify(encrypted));
      }

      setAddresses({
        solana: wallets.solana.address,
        bitcoin: wallets.bitcoin.address,
        bnb: wallets.bnb.address,
      });

      // Correct login action from Auth store
      login('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock_token');
      
      setInitialized(true);
      setStep(3);
    } catch (err: any) {
      setError('Error al importar la frase semilla');
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => {
    const getStepDotClass = (current: number) => {
      const isCompleted = step > current;
      const isActive = step === current;
      if (isCompleted) return 'border-success bg-success text-white';
      if (isActive) return 'border-accent-secondary text-accent-secondary shadow-xs';
      return 'border-slate-200 text-slate-400 bg-white';
    };

    const steps = [
      { label: 'Semilla' },
      { label: 'Configurar PIN' },
      { label: 'Listo' },
    ];

    return (
      <div className="mb-8 md:mb-10 px-1">
        <div className="relative flex items-center justify-between w-full">
          {/* Background line connecting all steps */}
          <div className="absolute left-0 right-0 top-4 h-[2px] bg-slate-200 z-1" />
          
          {/* Progress bar line */}
          <div 
            className="absolute left-0 top-4 h-[2px] bg-accent-secondary z-1 transition-all duration-300" 
            style={{ width: `${((step - 1) / 2) * 100}%` }}
          />

          {steps.map((s, index) => {
            const isCurrent = step === index + 1;
            return (
              <div key={index} className="flex flex-col items-center flex-1 relative z-2">
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all duration-300 bg-white ${getStepDotClass(index + 1)}`}>
                  {step > index + 1 ? <Check size={14} className="stroke-[3]" /> : (index + 1)}
                </div>
                <span className={`text-[9px] md:text-[10px] font-bold uppercase tracking-wider mt-2.5 text-center select-none ${isCurrent ? 'text-accent-primary font-extrabold' : 'text-text-tertiary'}`}>
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <Card className="max-w-md mx-auto p-6 md:p-8 border border-border bg-bg-primary shadow-xs animate-fade-in">
      {renderStepIndicator()}

      {step === 1 && (
        <div className="flex flex-col gap-5">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="p-3 rounded-xl bg-accent-light text-accent-secondary flex items-center justify-center mb-1">
              <KeyRound size={28} className="text-accent-primary animate-pulse" />
            </div>
            <div className="flex flex-col gap-1.5">
              <h2 className="text-xl font-bold text-accent-primary tracking-tight">Importar Wallet</h2>
              <p className="text-xs md:text-sm text-text-secondary leading-relaxed max-w-xs font-medium">
                Ingrese su frase de recuperación de 12 o 24 palabras separadas por espacios.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 my-1">
            <textarea
              className="w-full bg-bg-input border-1.5 border-border rounded-xl min-h-[100px] resize-none text-xs tracking-wide leading-relaxed font-mono p-3.5 focus:border-accent-secondary focus:ring-3 focus:ring-accent-secondary/12 outline-none transition-all duration-200 placeholder:text-text-tertiary text-text-primary"
              placeholder="word1 word2 word3..."
              value={mnemonic}
              onChange={(e) => setMnemonic(e.target.value)}
            />
            {error && <span className="text-xs text-error font-semibold mt-1">{error}</span>}
          </div>

          <Button onClick={handleVerifySeed} fullWidth className="py-2.5 shadow-sm text-xs md:text-sm">
            Verificar Frase Semilla
          </Button>
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col gap-5">
          <div className="text-center flex flex-col gap-1.5">
            <h2 className="text-xl font-bold text-accent-primary tracking-tight">Configurar PIN de Acceso</h2>
            <p className="text-xs md:text-sm text-text-secondary max-w-xs mx-auto font-medium leading-relaxed">
              El PIN cifra tu frase semilla localmente. Nunca se transmite a la base de datos central.
            </p>
          </div>

          <div className="flex flex-col gap-3 my-1">
            <Input 
              label="PIN de 6 dígitos"
              type="password"
              placeholder="••••••"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6}
              className="text-center tracking-[0.5em] text-base font-bold py-2.5"
            />

            <Input 
              label="Confirmar PIN"
              type="password"
              placeholder="••••••"
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6}
              className="text-center tracking-[0.5em] text-base font-bold py-2.5"
              error={error}
            />
          </div>

          <Button onClick={handleImport} isLoading={loading} fullWidth className="py-2.5 mt-2 shadow-sm text-xs md:text-sm">
            Importar Wallet
          </Button>
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col items-center justify-center text-center p-2 gap-6 animate-fade-in">
          <div className="w-14 h-14 rounded-full bg-success-dim border border-success/30 flex items-center justify-center text-success shadow-xs shrink-0">
            <ShieldCheck size={30} className="text-success stroke-[2.5]" />
          </div>
          <div className="flex flex-col gap-1.5">
            <h2 className="text-xl font-bold text-accent-primary tracking-tight">¡Wallet Importada!</h2>
            <p className="text-xs text-text-secondary max-w-xs font-semibold leading-relaxed">
              Las claves asociadas han sido recuperadas y cifradas exitosamente.
            </p>
          </div>

          <Button onClick={() => router.push('/dashboard')} fullWidth className="py-2.5 mt-1 shadow-sm text-xs md:text-sm">
            Ir al Dashboard
          </Button>
        </div>
      )}
    </Card>
  );
}
