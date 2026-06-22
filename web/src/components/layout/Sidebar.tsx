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
  Wallet,
  Shield,
  Menu,
  X
} from 'lucide-react';
import { useUIStore } from '@/lib/store/ui-store';
import { useAuthStore } from '@/lib/store/auth-store';

export function Sidebar() {
  const pathname = usePathname();
  const { isSidebarOpen, toggleSidebar } = useUIStore();
  const { logout, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) return null;

  const links = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/send', label: 'Enviar', icon: Send },
    { href: '/receive', label: 'Recibir', icon: QrCode },
    { href: '/history', label: 'Historial', icon: History },
    { href: '/settings', label: 'Ajustes', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Toggle Button */}
      <button 
        onClick={toggleSidebar}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-secondary border border-border text-primary"
      >
        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Backdrop for mobile */}
      {isSidebarOpen && (
        <div 
          onClick={toggleSidebar}
          className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-secondary border-r border-border z-40 transition-transform duration-300 md:transform-none flex flex-col justify-between p-6
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        <div className="flex flex-col gap-8">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-accent-primary to-accent-secondary animate-pulse-glow">
              <Wallet size={24} className="text-white" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-wider gradient-text font-sans">A-WALLET</span>
              <span className="block text-[10px] text-text-secondary font-mono tracking-widest uppercase">Decentralized</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-2">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => {
                    if (window.innerWidth < 768) toggleSidebar();
                  }}
                  className={`sidebar-link ${isActive ? 'active' : ''}`}
                >
                  <Icon size={20} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer actions */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-bg-tertiary/50 border border-border/50">
            <Shield size={16} className="text-success animate-float" />
            <div className="text-[11px]">
              <span className="block text-text-primary font-semibold">Non-Custodial</span>
              <span className="text-text-secondary">Keys are encrypted locally</span>
            </div>
          </div>

          <button 
            onClick={logout}
            className="w-full btn-secondary text-sm py-2 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 transition-all duration-300"
          >
            Cerrar Sesión
          </button>
        </div>
      </aside>
    </>
  );
}
