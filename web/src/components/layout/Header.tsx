'use client';

import React from 'react';
import { NetworkSelector } from './NetworkSelector';
import { useAuthStore } from '@/lib/store/auth-store';
import { Bell, User } from 'lucide-react';
import { usePathname } from 'next/navigation';

export function Header() {
  const { isAuthenticated, isLocked } = useAuthStore();
  const pathname = usePathname();

  if (!isAuthenticated || isLocked) return null;

  const getPageTitle = () => {
    if (pathname.includes('/dashboard')) return 'Resumen de Cuenta';
    if (pathname.includes('/history')) return 'Historial de Transacciones';
    if (pathname.includes('/settings')) return 'Configuración';
    if (pathname.includes('/send')) return 'Enviar Fondos';
    if (pathname.includes('/receive')) return 'Recibir Fondos';
    return 'Mi Billetera';
  };

  return (
    <header className="w-full bg-bg-primary border-b border-border px-8 py-5 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <div className="flex flex-col">
          <h1 className="text-xl font-bold font-sans text-text-primary tracking-tight">
            {getPageTitle()}
          </h1>
          <p className="text-xs text-text-tertiary font-medium mt-0.5 hidden sm:block">
            Gestión segura de tus activos digitales
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Network Selector se encarga de mostrar la red actual */}
        <NetworkSelector />

        {/* Separador */}
        <div className="h-5 w-[1px] bg-border/80 mx-1 hidden sm:block" />

        {/* Acciones de usuario */}
        <div className="flex items-center gap-2">
          <button 
            aria-label="Notificaciones"
            className="relative p-2.5 rounded-xl bg-bg-secondary border border-transparent hover:border-border hover:bg-bg-tertiary text-text-secondary hover:text-text-primary transition-all duration-200"
          >
            <Bell size={18} strokeWidth={2} />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-accent-primary ring-2 ring-bg-secondary" />
          </button>
          
          <div className="w-10 h-10 rounded-xl bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center text-accent-primary hidden sm:flex cursor-pointer hover:bg-accent-primary/20 transition-colors">
            <User size={18} strokeWidth={2.5} />
          </div>
        </div>
      </div>
    </header>
  );
}
