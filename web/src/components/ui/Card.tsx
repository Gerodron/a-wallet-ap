'use client';

import React from 'react';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'accent' | 'flat';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  animate?: boolean;
}

export function Card({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
  onClick,
  animate = false,
}: CardProps) {
  const variantClass = variant === 'accent' 
    ? 'glass-card-accent' 
    : variant === 'flat' 
    ? '' 
    : 'glass-card';

  const paddingMap: Record<string, string> = {
    none: '0',
    sm: '12px',
    md: '20px',
    lg: '28px',
  };

  return (
    <div
      className={`${variantClass} ${animate ? 'animate-fade-in' : ''} ${className}`}
      style={{
        padding: paddingMap[padding],
        cursor: onClick ? 'pointer' : undefined,
      }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  );
}
