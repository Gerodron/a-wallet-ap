'use client';

import React from 'react';

type BadgeVariant = 'success' | 'error' | 'warning' | 'network' | 'solana' | 'bitcoin' | 'bnb';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = 'network', children, className = '' }: BadgeProps) {
  const getStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'success':
        return { background: 'var(--success-dim)', color: 'var(--success)' };
      case 'error':
        return { background: 'var(--error-dim)', color: 'var(--error)' };
      case 'warning':
        return { background: 'var(--warning-dim)', color: 'var(--warning)' };
      case 'solana':
        return { background: 'rgba(153, 69, 255, 0.15)', color: '#9945FF' };
      case 'bitcoin':
        return { background: 'rgba(247, 147, 26, 0.15)', color: '#F7931A' };
      case 'bnb':
        return { background: 'rgba(240, 185, 11, 0.15)', color: '#F0B90B' };
      default:
        return { background: 'rgba(108, 99, 255, 0.15)', color: 'var(--accent-primary)' };
    }
  };

  return (
    <span className={`badge ${className}`} style={getStyles()}>
      {children}
    </span>
  );
}
