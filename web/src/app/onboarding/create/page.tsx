'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, Input } from '@/components/ui';
import { generateMnemonic, deriveAllWallets } from '@/lib/crypto/wallet-generator';
import { encryptData } from '@/lib/crypto/encryption';
import { useWallet } from '@/lib/hooks/useWallet';
import { useAuthStore } from '@/lib/store/auth-store';
import { AlertTriangle, ShieldCheck, Copy, Check } from 'lucide-react';
import { financeService } from '@/lib/api/financeService';

export default function CreateWalletPage() {
  const router = useRouter();
  const { setInitialized, setAddresses } = useWallet();
  const { login } = useAuthStore();
  
  const [step, setStep] = useState(1); // 1: Info, 2: Reveal Seed, 3: Confirm Seed, 4: Set PIN, 5: Done
  const [mnemonic, setMnemonic] = useState('');
  const [backupConfirmed, setBackupConfirmed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [verificationIndex, setVerificationIndex] = useState(0);
  const [verificationWord, setVerificationWord] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const startCreation = () => {
    const phrase = generateMnemonic();
    setMnemonic(phrase);
    setVerificationIndex(Math.floor(Math.random() * 10) + 1);
    setStep(2);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(mnemonic);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const verifyMnemonic = () => {
    setError('');
    const words = mnemonic.split(' ');
    const correctWord = words[verificationIndex];
    if (verificationWord.trim().toLowerCase() !== correctWord) {
      setError('Palabra incorrecta. Por favor verifica tu frase de respaldo.');
      return;
    }
    setStep(4);
  };

  const saveWallet = async () => {
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

      const payloadAddresses = {
        solana: wallets.solana.address,
        bitcoin: wallets.bitcoin.address,
        bnb: wallets.bnb.address,
      };

      // Call API register
      const response = await financeService.register({
        username: 'user_' + wallets.solana.address.slice(0, 8),
        pin: pin,
        addresses: payloadAddresses
      });

      setAddresses(payloadAddresses);

      // Use the correct login action from store with the API token
      login(response.token);
      
      setInitialized(true);
      setStep(5);
    } catch (err: any) {
      setError(err instanceof Error ? err.message : 'Error al registrar la wallet en la API');
    } finally {
      setLoading(false);
    }
  };

  const words = mnemonic.split(' ');

  const renderStepIndicator = () => {
    const getStepDotClass = (current: number) => {
      const isCompleted = step > current;
      const isActive = step === current;
      if (isCompleted) return 'border-success bg-success text-white';
      if (isActive) return 'border-accent-secondary text-accent-secondary shadow-xs';
      return 'border-slate-200 text-slate-400 bg-white';
    };

    const steps = [
      { label: 'Inicio' },
      { label: 'Semilla' },
      { label: 'Verificar' },
      { label: 'PIN' },
      { label: 'Fin' },
    ];

    return (
      <div className="mb-8 md:mb-10 px-1">
        <div className="relative flex items-center justify-between w-full">
          {/* Background line connecting all steps */}
          <div className="absolute left-0 right-0 top-4 h-[2px] bg-slate-200 z-1" />
          
          {/* Progress bar line */}
          <div 
            className="absolute left-0 top-4 h-[2px] bg-accent-secondary z-1 transition-all duration-300" 
            style={{ width: `${((step - 1) / 4) * 100}%` }}
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
        <div className="flex flex-col gap-6 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="p-3 rounded-xl bg-accent-light text-accent-secondary flex items-center justify-center mb-1">
              <ShieldCheck size={32} className="text-accent-primary animate-pulse" />
            </div>
            <div className="flex flex-col gap-1.5">
              <h2 className="text-xl font-bold text-accent-primary tracking-tight">Crear Wallet Soberana</h2>
              <p className="text-xs md:text-sm text-text-secondary leading-relaxed max-w-xs font-medium">
                Se generará una frase semilla única de 12 palabras que controlará tus fondos en todas las redes.
              </p>
            </div>
          </div>

          <div className="p-4 md:p-5 rounded-xl bg-warning-dim border border-warning/15 text-left flex items-start gap-3">
            <AlertTriangle size={18} className="text-warning shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="block text-xs font-bold text-accent-primary mb-1">¡Advertencia de Seguridad!</span>
              <p className="text-[11px] text-text-secondary leading-relaxed font-medium">
                Tú eres el único responsable de esta frase. Si la pierdes, perderás el acceso a tus fondos para siempre. Ningún servidor ni soporte técnico podrá ayudarte a recuperarla.
              </p>
            </div>
          </div>

          <Button onClick={startCreation} fullWidth className="py-2.5 shadow-sm text-xs md:text-sm">
            Generar Frase Semilla
          </Button>
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col gap-5">
          <div className="text-center flex flex-col gap-1.5">
            <h2 className="text-xl font-bold text-accent-primary tracking-tight">Frase Mnemónica de Respaldo</h2>
            <p className="text-xs md:text-sm text-text-secondary max-w-xs mx-auto leading-relaxed font-medium">
              Escribe estas 12 palabras en el orden correcto en un papel y guárdalo en un lugar seguro offline.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 my-3">
            {words.map((word, index) => (
              <div key={index} className="seed-word">
                <span className="seed-index">{index + 1}</span>
                <span className="seed-text">{word}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-3 mt-4">
            <Button variant="secondary" onClick={handleCopy} className="flex-1 py-2.5 text-xs md:text-sm shadow-xs">
              {copied ? <Check size={14} className="text-success mr-1.5 stroke-[3]" /> : <Copy size={14} className="mr-1.5" />}
              <span>Copiar frase</span>
            </Button>
            <Button 
              variant={backupConfirmed ? 'primary' : 'secondary'}
              onClick={() => setStep(3)} 
              disabled={!backupConfirmed}
              className="flex-1 py-2.5 text-xs md:text-sm shadow-xs"
            >
              <span>Siguiente</span>
            </Button>
          </div>

          <label className="flex items-start gap-2.5 mt-4 cursor-pointer select-none text-left p-3.5 rounded-xl border border-border bg-bg-secondary hover:bg-bg-tertiary transition-all duration-200">
            <input 
              type="checkbox" 
              checked={backupConfirmed} 
              onChange={(e) => setBackupConfirmed(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-accent-primary shrink-0 cursor-pointer"
            />
            <span className="text-[11px] text-text-secondary leading-normal font-semibold">
              Confirmo que he respaldado mi frase mnemónica con seguridad y en orden.
            </span>
          </label>
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col gap-5">
          <div className="text-center flex flex-col gap-1.5">
            <h2 className="text-xl font-bold text-accent-primary tracking-tight">Verificación de Frase</h2>
            <p className="text-xs md:text-sm text-text-secondary max-w-xs mx-auto font-medium leading-relaxed">
              Para comprobar que la has guardado, escribe la palabra número <strong className="text-accent-secondary">#{verificationIndex + 1}</strong> de tu frase semilla.
            </p>
          </div>

          <div className="my-2">
            <Input 
              placeholder={`Palabra #${verificationIndex + 1}`}
              value={verificationWord}
              onChange={(e) => setVerificationWord(e.target.value.replace(/[^a-zA-Z]/g, ''))}
              error={error}
            />
          </div>

          <Button onClick={verifyMnemonic} fullWidth className="py-2.5 mt-2 shadow-sm text-xs md:text-sm">
            Confirmar y Continuar
          </Button>
        </div>
      )}

      {step === 4 && (
        <div className="flex flex-col gap-5">
          <div className="text-center flex flex-col gap-1.5">
            <h2 className="text-xl font-bold text-accent-primary tracking-tight">Configurar PIN de Acceso</h2>
            <p className="text-xs md:text-sm text-text-secondary max-w-xs mx-auto leading-relaxed font-medium">
              Este PIN de 6 dígitos se usará localmente para cifrar tus llaves y firmar transacciones en este navegador.
            </p>
          </div>

          <div className="flex flex-col gap-3 my-1">
            <Input 
              label="PIN Numérico"
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

          <Button onClick={saveWallet} isLoading={loading} fullWidth className="py-2.5 mt-2 shadow-sm text-xs md:text-sm">
            Finalizar Configuración
          </Button>
        </div>
      )}

      {step === 5 && (
        <div className="flex flex-col items-center justify-center text-center p-2 gap-6 animate-fade-in">
          <div className="w-14 h-14 rounded-full bg-success-dim border border-success/30 flex items-center justify-center text-success shadow-xs shrink-0">
            <ShieldCheck size={30} className="text-success stroke-[2.5]" />
          </div>
          <div className="flex flex-col gap-1.5">
            <h2 className="text-xl font-bold text-accent-primary tracking-tight">¡Wallet Creada con Éxito!</h2>
            <p className="text-xs text-text-secondary max-w-xs font-semibold leading-relaxed">
              Tus llaves han sido generadas y cifradas de forma segura localmente con AES-256.
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
