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
      return 'border-slate-200 text-slate-400 bg-bg-primary';
    };

    return (
      <div className="mb-6 px-1">
        <div className="relative flex items-center justify-between w-full before:content-[''] before:absolute before:h-[2px] before:bg-slate-200 before:top-1/2 before:left-0 before:right-0 before:-translate-y-1/2 before:z-1">
          {/* Progress bar line */}
          <div 
            className="absolute h-[2px] bg-accent-secondary top-1/2 -translate-y-1/2 z-1 transition-all duration-300" 
            style={{ width: `${((step - 1) / 2) * 100}%` }}
          />
          {[1, 2, 3].map((i) => (
            <div 
              key={i} 
              className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-[10px] font-extrabold relative z-2 transition-all duration-300 ${getStepDotClass(i)}`}
            >
              {step > i ? <Check size={12} className="stroke-[3]" /> : i}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-[8px] text-text-tertiary font-bold uppercase tracking-wider mt-2.5 px-0.5 select-none">
          <span>Semilla</span>
          <span>Configurar PIN</span>
          <span>Listo</span>
        </div>
      </div>
    );
  };

  return (
    <Card className="max-w-md mx-auto p-6 md:p-8 border border-border bg-bg-primary shadow-md animate-fade-in">
      {renderStepIndicator()}

      {step === 1 && (
        <div className="flex flex-col gap-5">
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="p-3.5 rounded-xl bg-accent-light text-accent-primary flex items-center justify-center">
              <KeyRound size={32} className="text-accent-secondary animate-pulse" />
            </div>
            <h2 className="text-xl font-bold text-accent-primary mt-2 tracking-tight">Importar Wallet</h2>
            <p className="text-xs text-text-secondary leading-relaxed px-2 font-medium">
              Ingrese su frase de recuperación de 12 o 24 palabras separadas por espacios.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <textarea
              className="input-field min-h-[120px] resize-none text-sm tracking-wide leading-relaxed font-mono p-4 border border-border focus:border-accent-secondary focus:ring-2 focus:ring-accent-secondary/10 outline-none rounded-xl"
              placeholder="word1 word2 word3..."
              value={mnemonic}
              onChange={(e) => setMnemonic(e.target.value)}
            />
            {error && <span className="text-xs text-error font-semibold mt-1">{error}</span>}
          </div>

          <Button onClick={handleVerifySeed} fullWidth className="shadow-xs">
            Verificar Frase Semilla
          </Button>
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col gap-5">
          <h2 className="text-lg font-bold text-accent-primary text-center tracking-tight">Configurar PIN de Acceso</h2>
          <p className="text-xs text-text-secondary text-center font-medium leading-relaxed">
            El PIN cifra tu frase semilla localmente. Nunca se transmite a la base de datos central.
          </p>

          <Input 
            label="PIN de 6 dígitos"
            type="password"
            placeholder="••••••"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
            maxLength={6}
            className="text-center tracking-[0.5em] text-lg font-bold"
          />

          <Input 
            label="Confirmar PIN"
            type="password"
            placeholder="••••••"
            value={confirmPin}
            onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
            maxLength={6}
            className="text-center tracking-[0.5em] text-lg font-bold"
            error={error}
          />

          <Button onClick={handleImport} isLoading={loading} fullWidth className="shadow-xs">
            Importar Wallet
          </Button>
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col items-center justify-center text-center p-4 gap-6 animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-success-dim border border-success/30 flex items-center justify-center text-success shadow-sm">
            <ShieldCheck size={32} className="text-success stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-accent-primary tracking-tight">¡Wallet Importada!</h2>
            <p className="text-xs text-text-secondary mt-1.5 font-semibold">
              Las claves asociadas han sido recuperadas y cifradas exitosamente.
            </p>
          </div>

          <Button onClick={() => router.push('/dashboard')} fullWidth className="shadow-xs">
            Ir al Dashboard
          </Button>
        </div>
      )}
    </Card>
  );
}
