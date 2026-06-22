'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, Input } from '@/components/ui';
import { generateMnemonic, deriveAllWallets } from '@/lib/crypto/wallet-generator';
import { encryptData } from '@/lib/crypto/encryption';
import { useWallet } from '@/lib/hooks/useWallet';
import { useAuthStore } from '@/lib/store/auth-store';
import { AlertTriangle, ShieldCheck, Copy, Check } from 'lucide-react';

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

      setAddresses({
        solana: wallets.solana.address,
        bitcoin: wallets.bitcoin.address,
        bnb: wallets.bnb.address,
      });

      // Use the correct login action from store
      login('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock_token');
      
      setInitialized(true);
      setStep(5);
    } catch (err: any) {
      setError('Error al generar la wallet');
    } finally {
      setLoading(false);
    }
  };

  const words = mnemonic.split(' ');

  return (
    <Card className="max-w-md mx-auto p-6 md:p-8">
      {step === 1 && (
        <div className="flex flex-col gap-6 text-center">
          <div className="flex flex-col items-center gap-2">
            <ShieldCheck size={44} className="text-accent-primary animate-pulse" />
            <h2 className="text-xl font-bold text-text-primary mt-2">Crear Wallet Soberana</h2>
            <p className="text-xs text-text-secondary leading-relaxed px-4">
              Se generará una frase semilla única de 12 palabras que controlará tus fondos en todas las redes.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-bg-tertiary border border-border text-left flex gap-3 text-xs text-text-secondary leading-relaxed">
            <AlertTriangle size={18} className="text-warning shrink-0 mt-0.5" />
            <div>
              <span className="block font-semibold text-text-primary mb-1">¡Advertencia de Seguridad!</span>
              Tú eres el único responsable de esta frase. Si la pierdes, perderás el acceso a tus fondos para siempre. Ningún servidor ni soporte técnico podrá ayudarte a recuperarla.
            </div>
          </div>

          <Button onClick={startCreation} fullWidth>
            Generar Frase Semilla
          </Button>
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col gap-5">
          <h2 className="text-lg font-bold text-text-primary text-center">Frase Mnemónica de Respaldo</h2>
          <p className="text-xs text-text-secondary text-center leading-relaxed">
            Escribe estas 12 palabras en el orden correcto en un papel y guárdalo en un lugar seguro offline.
          </p>

          <div className="grid grid-cols-3 gap-2.5 my-3">
            {words.map((word, index) => (
              <div key={index} className="seed-word">
                <span className="seed-index">{index + 1}</span>
                <span className="seed-text">{word}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Button variant="secondary" onClick={handleCopy} className="flex-1 text-xs py-2.5">
              {copied ? <Check size={14} className="text-success mr-1.5" /> : <Copy size={14} className="mr-1.5" />}
              <span>Copiar</span>
            </Button>
            <Button 
              variant={backupConfirmed ? 'primary' : 'secondary'}
              onClick={() => setStep(3)} 
              disabled={!backupConfirmed}
              className="flex-1 text-xs py-2.5"
            >
              <span>Siguiente</span>
            </Button>
          </div>

          <label className="flex items-start gap-3 mt-2 cursor-pointer select-none">
            <input 
              type="checkbox" 
              checked={backupConfirmed} 
              onChange={(e) => setBackupConfirmed(e.target.checked)}
              className="mt-0.5 accent-accent-primary"
            />
            <span className="text-[11px] text-text-secondary leading-relaxed">
              Confirmo que he respaldado mi frase mnemónica con seguridad y en orden.
            </span>
          </label>
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col gap-5">
          <h2 className="text-lg font-bold text-text-primary text-center">Verificación de Frase</h2>
          <p className="text-xs text-text-secondary text-center">
            Para comprobar que la has guardado, escribe la palabra número <strong className="text-accent-primary">#{verificationIndex + 1}</strong> de tu frase semilla.
          </p>

          <Input 
            placeholder={`Palabra #${verificationIndex + 1}`}
            value={verificationWord}
            onChange={(e) => setVerificationWord(e.target.value.replace(/[^a-zA-Z]/g, ''))}
            error={error}
          />

          <Button onClick={verifyMnemonic} fullWidth>
            Confirmar y Continuar
          </Button>
        </div>
      )}

      {step === 4 && (
        <div className="flex flex-col gap-5">
          <h2 className="text-lg font-bold text-text-primary text-center">Configurar PIN de Acceso</h2>
          <p className="text-xs text-text-secondary text-center leading-relaxed">
            Este PIN de 6 dígitos se usará localmente para cifrar tus llaves y firmar transacciones en este navegador.
          </p>

          <Input 
            label="PIN Numérico"
            type="password"
            placeholder="••••••"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
            maxLength={6}
            className="text-center tracking-widest text-lg font-bold"
          />

          <Input 
            label="Confirmar PIN"
            type="password"
            placeholder="••••••"
            value={confirmPin}
            onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
            maxLength={6}
            className="text-center tracking-widest text-lg font-bold"
            error={error}
          />

          <Button onClick={saveWallet} isLoading={loading} fullWidth>
            Finalizar Configuración
          </Button>
        </div>
      )}

      {step === 5 && (
        <div className="flex flex-col items-center justify-center text-center p-4 gap-6">
          <div className="w-16 h-16 rounded-full bg-success-dim border border-success/30 flex items-center justify-center text-success animate-pulse-glow">
            <ShieldCheck size={32} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-text-primary">¡Wallet Creada con Éxito!</h2>
            <p className="text-xs text-text-secondary mt-1 max-w-xs">
              Tus llaves han sido generadas y cifradas de forma segura localmente con AES-256.
            </p>
          </div>

          <Button onClick={() => router.push('/dashboard')} fullWidth>
            Ir al Dashboard
          </Button>
        </div>
      )}
    </Card>
  );
}
