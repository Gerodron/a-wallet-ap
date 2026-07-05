'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, Input } from '@/components/ui';
import { useAuthStore } from '@/lib/store/auth-store';
import { useWalletStore } from '@/lib/store/wallet-store';
import { ShieldAlert, KeyRound } from 'lucide-react';
import Link from 'next/link';
import { financeService } from '@/lib/api/financeService';

export default function EntryPage() {
  const router = useRouter();
  const { login, failedAttempts, maxFailedAttempts, isLocked, incrementFailedAttempts } = useAuthStore();
  const { isInitialized } = useWalletStore();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isInitialized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[85vh] gap-8 max-w-md mx-auto text-center px-4 py-6">
        <div className="flex flex-col items-center gap-4">
          <div className="p-4 rounded-xl bg-accent-primary animate-float flex items-center justify-center shadow-xs">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 text-white">
              <path d="M12 2L3 7v6c0 5.5 4.5 10 9 10s9-4.5 9-10V7l-9-5z" />
              <path d="M12 8v8" />
              <path d="M9 13h6" />
            </svg>
          </div>
          <div className="flex flex-col gap-2 mt-1">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-accent-primary font-sans">
              A-Wallet
            </h1>
            <p className="text-xs md:text-sm text-text-secondary leading-relaxed max-w-xs font-medium">
              Tus claves, tus tokens. Gestiona Solana, Bitcoin y BNB en una sola interfaz soberana.
            </p>
          </div>
        </div>

        <div className="w-full flex flex-col gap-3">
          <Link href="/onboarding/create" className="w-full">
            <Button variant="primary" fullWidth className="py-3 shadow-sm text-xs md:text-sm">
              Crear Nueva Wallet
            </Button>
          </Link>
          <Link href="/onboarding/import" className="w-full">
            <Button variant="outline" fullWidth className="py-3 text-xs md:text-sm">
              Importar con Frase Semilla
            </Button>
          </Link>
        </div>

        <div className="flex items-center gap-2 text-[10px] md:text-xs text-text-secondary font-semibold bg-bg-primary py-2 px-4 rounded-full border border-border shadow-xs mt-2">
          <ShieldAlert size={14} className="text-accent-secondary shrink-0" />
          <span>Arquitectura híbrida MVC y no custodial</span>
        </div>
      </div>
    );
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (pin.length < 6) {
      setError('El PIN debe tener 6 dígitos');
      return;
    }

    setLoading(true);
    try {
      const response = await financeService.login(pin);
      login(response.token);
      router.push('/dashboard');
    } catch (err) {
      incrementFailedAttempts();
      setError(err instanceof Error ? err.message : 'Error al conectar con la API de desbloqueo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto p-6 md:p-8 border border-border bg-bg-primary shadow-xs">
      <form onSubmit={handleLogin} className="flex flex-col gap-6 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="p-3 rounded-xl bg-accent-light border border-border-accent flex items-center justify-center shrink-0">
            <KeyRound size={26} className="text-accent-primary animate-pulse" />
          </div>
          <div className="flex flex-col gap-1.5">
            <h2 className="text-xl font-bold text-accent-primary tracking-tight">Desbloquear Wallet</h2>
            <p className="text-[11px] md:text-xs text-text-secondary font-medium">Ingrese su PIN numérico para continuar</p>
          </div>
        </div>

        <div className="my-1">
          <Input 
            type="password"
            placeholder="••••••"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
            maxLength={6}
            className="text-center text-xl tracking-[0.75em] font-bold py-2.5"
            autoFocus
            disabled={loading || isLocked}
          />
        </div>

        {error && (
          <div className="flex flex-col gap-2">
            <div className="p-3 rounded-xl bg-error-dim border border-error/15 text-error text-[11px] md:text-xs font-semibold leading-relaxed text-left flex items-start gap-2.5">
              <ShieldAlert size={14} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
            {failedAttempts > 0 && (
              <div className="text-[11px] md:text-xs font-bold text-orange-500 bg-orange-500/10 p-2 rounded-lg border border-orange-500/20 text-center">
                Te quedan {maxFailedAttempts - failedAttempts} intentos antes de borrar la billetera
              </div>
            )}
          </div>
        )}

        <Button type="submit" isLoading={loading} disabled={isLocked || pin.length < 6} fullWidth className="py-3 shadow-sm text-xs md:text-sm">
          Desbloquear
        </Button>
      </form>
    </Card>
  );
}
