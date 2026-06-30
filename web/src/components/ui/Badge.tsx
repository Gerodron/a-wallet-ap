'use client';

import React from 'react';

type BadgeVariant = 'success' | 'error' | 'warning' | 'network' | 'solana' | 'bitcoin' | 'bnb';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = 'network', children, className = '' }: BadgeProps) {
  const baseClass = "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border select-none transition-all duration-200";

  const variantClasses: Record<BadgeVariant, string> = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
    error: 'bg-red-50 text-red-700 border-red-200/60',
    warning: 'bg-amber-50 text-amber-800 border-amber-200/60',
    network: 'bg-slate-100 text-slate-700 border-slate-200',
    solana: 'bg-[#9945FF]/10 text-[#7A22E0] border-[#9945FF]/20',
    bitcoin: 'bg-[#F7931A]/10 text-[#C46A00] border-[#F7931A]/20',
    bnb: 'bg-[#F0B90B]/10 text-[#926B00] border-[#F0B90B]/20',
  };

  return (
    <span className={`${baseClass} ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
}
