'use client';

import React from 'react';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'accent' | 'flat';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  animate?: boolean;
  style?: React.CSSProperties;
}

export function Card({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
  onClick,
  animate = false,
  style,
}: CardProps) {
  const variantClass = variant === 'accent' 
    ? 'bg-bg-elevated border border-accent-primary/20 rounded-2xl shadow-xs hover:border-accent-primary/40 hover:shadow-sm transition-all duration-300' 
    : variant === 'flat' 
    ? 'bg-transparent border-none shadow-none' 
    : 'bg-bg-elevated border border-border rounded-2xl shadow-xs hover:border-border-hover hover:shadow-xs transition-all duration-300';

  const paddingMap: Record<string, string> = {
    none: 'p-0',
    sm: 'p-3.5 md:p-4',
    md: 'p-5 md:p-6',
    lg: 'p-7 md:p-8',
  };

  const cursorClass = onClick ? 'cursor-pointer hover:scale-[1.005] focus-visible:ring-2 focus-visible:ring-accent-secondary outline-none' : '';

  return (
    <div
      className={`${variantClass} ${paddingMap[padding]} ${cursorClass} ${animate ? 'animate-fade-in' : ''} ${className}`}
      style={style}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {children}
    </div>
  );
}
