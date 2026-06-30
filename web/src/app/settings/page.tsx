'use client';

import React from 'react';
import { Card, Button } from '@/components/ui';
import { Settings, Shield, Lock, CircleAlert, Check } from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth-store';
import { useWalletStore } from '@/lib/store/wallet-store';
import { useState } from 'react';

export default function SettingsPage() {
  const { failedAttempts, lock } = useAuthStore();
  const { isBalanceHidden, toggleBalanceVisibility, reset } = useWalletStore();
  const [purged, setPurged] = useState(false);

  const handlePurge = () => {
    // Purges secure storage & wallet preferences completely (BR-05 / security mitigation)
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }
    reset();
    setPurged(true);
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex items-center gap-2">
        <Settings size={18} className="text-text-secondary" />
        <div>
          <h2 className="text-xl font-bold text-accent-primary tracking-tight font-sans">Configuración General</h2>
          <p className="text-xs text-text-secondary mt-0.5 font-medium">Administra los parámetros de seguridad e interfaz local de la wallet.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Security & Access Block */}
        <Card className="flex flex-col gap-5 border border-border bg-bg-primary shadow-xs p-6">
          <div className="flex items-center gap-2 mb-1">
            <Shield size={16} className="text-accent-primary shrink-0" />
            <h3 className="text-xs font-bold text-accent-primary uppercase tracking-wider">Seguridad y Acceso</h3>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-text-primary">Bloqueo por Inactividad</span>
                <span className="text-[10px] text-text-secondary font-medium mt-0.5">Expira y cierra tu sesión local tras 15 minutos</span>
              </div>
              <span className="text-[10px] font-bold text-success font-mono uppercase bg-success-dim border border-success/15 px-2 py-0.5 rounded">
                Activo
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-text-primary">Intentos de PIN fallidos</span>
                <span className="text-[10px] text-text-secondary font-medium mt-0.5">Se purgará la llave tras 5 fallos consecutivos</span>
              </div>
              <span className="text-xs font-mono font-bold text-text-secondary">
                {failedAttempts} / 5
              </span>
            </div>
          </div>

          <Button variant="secondary" onClick={lock} className="flex items-center gap-2 text-xs py-2.5 px-4 shadow-xs mt-2">
            <Lock size={12} />
            <span>Bloquear Wallet Ahora</span>
          </Button>
        </Card>

        {/* Interface Preferences */}
        <Card className="flex flex-col gap-5 justify-between border border-border bg-bg-primary shadow-xs p-6">
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-2 mb-1">
              <Settings size={16} className="text-accent-primary shrink-0 animate-spin" style={{ animationDuration: '8s' }} />
              <h3 className="text-xs font-bold text-accent-primary uppercase tracking-wider">Interfaz</h3>
            </div>

            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-text-primary">Ocultar Balances por Defecto</span>
                <span className="text-[10px] text-text-secondary font-medium mt-0.5">Muestra asteriscos en lugar de saldos al iniciar</span>
              </div>
              <label className="inline-flex items-center cursor-pointer select-none">
                <input 
                  type="checkbox"
                  checked={isBalanceHidden}
                  onChange={toggleBalanceVisibility}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-checked:bg-accent-secondary rounded-full relative transition-all duration-200 after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:rounded-full after:h-[18px] after:w-[18px] after:transition-all peer-checked:after:translate-x-5 shadow-xs">
                </div>
              </label>
            </div>
          </div>

          {/* Reset / Purge Action (Mitigación OWASP) */}
          <div className="pt-4 border-t border-border mt-3">
            <div className="p-3.5 rounded-xl bg-error-dim border border-error/15 flex gap-2 text-[11px] text-error leading-normal font-semibold mb-4 text-left">
              <CircleAlert size={16} className="shrink-0 mt-0.5" />
              <span>
                Esta acción borrará definitivamente todas tus configuraciones cifradas de este navegador. Asegúrate de respaldar tus 12 palabras.
              </span>
            </div>
            <Button 
              variant="danger" 
              onClick={handlePurge}
              disabled={purged} 
              fullWidth 
              className="text-xs py-2.5 shadow-xs"
            >
              {purged ? (
                <div className="flex items-center gap-1.5 justify-center">
                  <Check size={14} className="stroke-[3]" />
                  <span>Wallet Purgada...</span>
                </div>
              ) : (
                'Eliminar Datos de Este Navegador'
              )}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
