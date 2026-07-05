'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Send, 
  QrCode, 
  History, 
  Settings, 
  Shield,
  Menu,
  X,
  LogOut
} from 'lucide-react';
import { useUIStore } from '@/lib/store/ui-store';
import { useAuthStore } from '@/lib/store/auth-store';

export function Sidebar() {
  const pathname = usePathname();
  const { isSidebarOpen, toggleSidebar } = useUIStore();
  const { logout, isAuthenticated, isLocked } = useAuthStore();

  if (!isAuthenticated || isLocked) return null;

  const links = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/send', label: 'Enviar', icon: Send },
    { href: '/receive', label: 'Recibir', icon: QrCode },
    { href: '/history', label: 'Historial', icon: History },
    { href: '/settings', label: 'Ajustes', icon: Settings },
  ];

  return (
    <>
      <button 
        onClick={toggleSidebar}
        aria-label="Abrir menú"
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-bg-primary border border-border text-text-primary shadow-sm hover:bg-bg-secondary transition-all"
      >
        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {isSidebarOpen && (
        <div 
          onClick={toggleSidebar}
          className="md:hidden fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs"
        />
      )}

      <aside 
        className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-bg-primary border-r border-border z-40 transition-transform duration-300 md:transform-none flex flex-col justify-between p-6 shadow-xs
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        <div className="flex flex-col gap-8">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-accent-primary flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-white">
                <path d="M12 2L3 7v6c0 5.5 4.5 10 9 10s9-4.5 9-10V7l-9-5z" />
                <path d="M12 8v8" />
                <path d="M9 13h6" />
              </svg>
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-accent-primary font-sans">A-Wallet</span>
              <span className="block text-[9px] text-text-tertiary font-bold tracking-wider uppercase leading-none mt-0.5">Fintech Custodial</span>
            </div>
          </div>

          <nav className="flex flex-col gap-1.5">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  id={`tour-sidebar-${link.href.replace('/', '')}`}
                  href={link.href}
                  onClick={() => {
                    if (window.innerWidth < 768) toggleSidebar();
                  }}
                  className={`sidebar-link ${isActive ? 'active' : ''}`}
                >
                  <Icon size={18} className="shrink-0" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-bg-secondary border border-border">
            <Shield size={16} className="text-success shrink-0" />
            <div className="text-[11px] leading-tight">
              <span className="block text-text-primary font-semibold">No Custodial</span>
              <span className="text-text-secondary">Claves locales cifradas</span>
            </div>
          </div>

          <button 
            onClick={logout}
            className="w-full btn-secondary text-xs py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-error-dim hover:text-error hover:border-error/20 transition-all duration-200"
          >
            <LogOut size={14} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
}
