'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, Input } from '@/components/ui';
import { validateMnemonic, deriveAllWallets } from '@/lib/crypto/wallet-generator';
import { encryptData } from '@/lib/crypto/encryption';
import { useWallet } from '@/lib/hooks/useWallet';
import { useAuthStore } from '@/lib/store/auth-store';
import { KeyRound, ShieldCheck } from 'lucide-react';

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

  return (
    <Card className="max-w-md mx-auto p-6 md:p-8">
      {step === 1 && (
        <div className="flex flex-col gap-5">
          <div className="flex flex-col items-center gap-2 text-center">
            <KeyRound size={36} className="text-accent-primary animate-pulse" />
            <h2 className="text-xl font-bold text-text-primary mt-2">Importar Wallet Existente</h2>
            <p className="text-xs text-text-secondary">
              Ingrese su frase de recuperación de 12 o 24 palabras separadas por espacios.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <textarea
              className="input-field min-h-[100px] resize-none text-sm tracking-wide leading-relaxed font-mono"
              placeholder="word1 word2 word3..."
              value={mnemonic}
              onChange={(e) => setMnemonic(e.target.value)}
            />
            {error && <span className="text-xs text-error font-medium">{error}</span>}
          </div>

          <Button onClick={handleVerifySeed} fullWidth>
            Verificar Frase Semilla
          </Button>
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col gap-5">
          <h2 className="text-lg font-bold text-text-primary text-center">Configurar PIN de Acceso</h2>
          <p className="text-xs text-text-secondary text-center">
            El PIN cifra tu frase semilla localmente. Nunca se transmite a la base de datos central.
          </p>

          <Input 
            label="PIN de 6 dígitos"
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

          <Button onClick={handleImport} isLoading={loading} fullWidth>
            Importar Wallet
          </Button>
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col items-center justify-center text-center p-4 gap-6">
          <div className="w-16 h-16 rounded-full bg-success-dim border border-success/30 flex items-center justify-center text-success animate-pulse-glow">
            <ShieldCheck size={32} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-text-primary">¡Wallet Importada!</h2>
            <p className="text-xs text-text-secondary mt-1">
              Las claves asociadas han sido recuperadas y cifradas exitosamente.
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
