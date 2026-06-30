'use client';

import React from 'react';

type BadgeVariant = 'success' | 'error' | 'warning' | 'network' | 'solana' | 'bitcoin' | 'bnb';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = 'network', children, className = '' }: BadgeProps) {
  const variantClasses: Record<BadgeVariant, string> = {
    success: 'badge-success',
    error: 'badge-error',
    warning: 'badge-warning',
    network: 'badge-network',
    solana: 'network-bg-solana network-solana border border-[#9945FF]/20',
    bitcoin: 'network-bg-bitcoin network-bitcoin border border-[#F7931A]/20',
    bnb: 'network-bg-bnb network-bnb border border-[#F0B90B]/20',
  };

  return (
    <span className={`badge ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
}
