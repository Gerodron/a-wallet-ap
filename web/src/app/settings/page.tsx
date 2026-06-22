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
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <Settings size={20} className="text-text-secondary" />
        <div>
          <h2 className="text-xl font-bold text-text-primary">Configuración General</h2>
          <p className="text-xs text-text-secondary mt-0.5">Administra los parámetros de seguridad e interfaz local de la wallet.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Security & Access Block */}
        <Card className="flex flex-col gap-5">
          <div className="flex items-center gap-2 mb-1">
            <Shield size={18} className="text-accent-primary shrink-0" />
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">Seguridad y Acceso</h3>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-text-primary">Bloqueo por Inactividad</span>
                <span className="text-[10px] text-text-secondary">Expira y cierra tu sesión local tras 15 minutos</span>
              </div>
              <span className="text-xs font-semibold text-success font-mono uppercase bg-success-dim/30 px-2 py-0.5 rounded border border-success/20">
                Activo
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-text-primary">Intentos de PIN fallidos</span>
                <span className="text-[10px] text-text-secondary">Se purgará la llave tras 5 fallos consecutivos</span>
              </div>
              <span className="text-xs font-mono font-semibold text-text-secondary">
                {failedAttempts} / 5
              </span>
            </div>
          </div>

          <Button variant="secondary" onClick={lock} className="flex items-center gap-2 text-xs py-2 px-4">
            <Lock size={14} />
            <span>Bloquear Wallet Ahora</span>
          </Button>
        </Card>

        {/* Interface Preferences */}
        <Card className="flex flex-col gap-5 justify-between">
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-2 mb-1">
              <Settings size={18} className="text-accent-primary shrink-0 animate-spin" style={{ animationDuration: '6s' }} />
              <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">Interfaz</h3>
            </div>

            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-text-primary">Ocultar Balances por Defecto</span>
                <span className="text-[10px] text-text-secondary">Muestra asteriscos en lugar de saldos al iniciar</span>
              </div>
              <input 
                type="checkbox"
                checked={isBalanceHidden}
                onChange={toggleBalanceVisibility}
                className="accent-accent-primary cursor-pointer w-4 h-4"
              />
            </div>
          </div>

          {/* Reset / Purge Action (Mitigación OWASP) */}
          <div className="pt-4 border-t border-border/50">
            <div className="p-3 rounded-lg bg-error-dim border border-error/20 flex gap-2 text-[10px] text-error leading-relaxed mb-4">
              <CircleAlert size={16} className="shrink-0" />
              <span>
                Esta acción borrará definitivamente todas tus configuraciones cifradas de este navegador. Asegúrate de respaldar tus 12 palabras.
              </span>
            </div>
            <Button 
              variant="danger" 
              onClick={handlePurge}
              disabled={purged} 
              fullWidth 
              className="text-xs py-2"
            >
              {purged ? (
                <div className="flex items-center gap-1.5 justify-center">
                  <Check size={14} />
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
