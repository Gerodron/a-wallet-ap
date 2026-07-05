'use client';

import React, { useState } from 'react';
import { Card, Button } from '@/components/ui';
import { Settings, Shield, Lock, CircleAlert, Check, Eye, KeyRound, MonitorSmartphone, Trash2 } from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth-store';
import { useWalletStore } from '@/lib/store/wallet-store';

export default function SettingsPage() {
  const { failedAttempts, lock } = useAuthStore();
  const { isBalanceHidden, toggleBalanceVisibility, reset } = useWalletStore();
  const [purged, setPurged] = useState(false);

  const handlePurge = () => {
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
    <div className="flex flex-col gap-8 max-w-4xl mx-auto py-4 animate-fade-in">
      


      <div className="flex flex-col gap-10">
        
        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-2 px-1">
            <Shield size={18} className="text-accent-primary" />
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">Seguridad</h3>
          </div>
          
          <Card className="flex flex-col border border-border bg-bg-primary shadow-xs p-0 overflow-hidden">
            
            <div className="group flex items-center justify-between p-5 border-b border-border hover:bg-bg-secondary/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-accent-primary/10 flex items-center justify-center text-accent-primary shrink-0">
                  <MonitorSmartphone size={18} />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-text-primary">Autobloqueo por Inactividad</span>
                  <span className="text-xs text-text-tertiary font-medium mt-0.5">La sesión local expira tras 15 minutos</span>
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                Activo
              </span>
            </div>

            <div className="group flex items-center justify-between p-5 border-b border-border hover:bg-bg-secondary/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 shrink-0">
                  <KeyRound size={18} />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-text-primary">Intentos de PIN</span>
                  <span className="text-xs text-text-tertiary font-medium mt-0.5">La llave se elimina tras 5 fallos</span>
                </div>
              </div>
              <span className="text-sm font-mono font-bold text-text-secondary bg-bg-secondary px-3 py-1 rounded-lg border border-border">
                {failedAttempts} / 5
              </span>
            </div>

            <div className="p-5 bg-bg-secondary/30 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-sm font-bold text-text-primary">Cierre de Sesión Inmediato</span>
                <span className="text-xs text-text-tertiary font-medium mt-0.5">Bloquea el acceso a la wallet ahora mismo</span>
              </div>
              <Button variant="secondary" onClick={lock} className="flex items-center gap-2 text-xs py-2 px-4 shadow-sm border-border-hover">
                <Lock size={14} />
                <span>Bloquear</span>
              </Button>
            </div>

          </Card>
        </section>

        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-2 px-1">
            <Settings size={18} className="text-accent-primary" />
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">Interfaz</h3>
          </div>
          
          <Card className="flex flex-col border border-border bg-bg-primary shadow-xs p-0 overflow-hidden">
            
            <div className="group flex items-center justify-between p-5 hover:bg-bg-secondary/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-accent-primary/10 flex items-center justify-center text-accent-primary shrink-0">
                  <Eye size={18} />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-text-primary">Ocultar Balances al Inicio</span>
                  <span className="text-xs text-text-tertiary font-medium mt-0.5">Privacidad visual activada por defecto</span>
                </div>
              </div>
              
              <label className="inline-flex items-center cursor-pointer select-none">
                <input 
                  type="checkbox"
                  checked={isBalanceHidden}
                  onChange={toggleBalanceVisibility}
                  className="sr-only peer"
                />
                <div className="w-12 h-6 bg-slate-200 peer-checked:bg-accent-primary rounded-full relative transition-all duration-300 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all after:duration-300 peer-checked:after:translate-x-6 shadow-inner border border-transparent peer-checked:border-accent-primary/50">
                </div>
              </label>
            </div>

          </Card>
        </section>

        <section className="flex flex-col gap-4 mt-4">
          <div className="flex items-center gap-2 px-1">
            <CircleAlert size={18} className="text-error" />
            <h3 className="text-sm font-bold text-error uppercase tracking-wider">Zona de Peligro</h3>
          </div>
          
          <Card className="flex flex-col border border-error/30 bg-error/5 shadow-xs p-0 overflow-hidden">
            <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
              <div className="flex flex-col gap-1 max-w-lg">
                <span className="text-sm font-bold text-error">Eliminar Datos Locales</span>
                <span className="text-xs text-error/80 font-medium leading-relaxed">
                  Esta acción borrará definitivamente todas tus configuraciones cifradas y billeteras generadas en este navegador. Perderás el acceso si no tienes tu frase de recuperación (12 palabras) respaldada.
                </span>
              </div>
              
              <Button 
                variant="danger" 
                onClick={handlePurge}
                disabled={purged} 
                className="text-xs py-3 px-5 shadow-sm whitespace-nowrap shrink-0 flex items-center gap-2"
              >
                {purged ? (
                  <>
                    <Check size={14} className="stroke-[3]" />
                    <span>Purgando...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={14} />
                    <span>Eliminar Billetera</span>
                  </>
                )}
              </Button>
            </div>
          </Card>
        </section>

      </div>
    </div>
  );
}
