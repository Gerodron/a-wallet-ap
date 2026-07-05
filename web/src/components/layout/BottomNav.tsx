'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Send, QrCode, History, Settings } from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth-store';

export function BottomNav() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) return null;

  const tabs = [
    { href: '/dashboard', label: 'Dash', icon: LayoutDashboard },
    { href: '/send', label: 'Enviar', icon: Send },
    { href: '/receive', label: 'Recibir', icon: QrCode },
    { href: '/history', label: 'Historial', icon: History },
    { href: '/settings', label: 'Ajustes', icon: Settings },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-bg-primary border-t border-border px-2 py-2 flex items-center justify-around z-30 shadow-lg pb-safe-bottom">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            id={`tour-bottomnav-${tab.href.replace('/', '')}`}
            href={tab.href}
            className={`bottom-nav-link ${isActive ? 'active' : ''}`}
          >
            <Icon size={18} className="nav-icon shrink-0" />
            <span className="text-[9px] font-bold tracking-wide font-sans">{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
