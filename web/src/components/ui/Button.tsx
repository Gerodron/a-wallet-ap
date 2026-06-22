'use client';

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const variantClass = `btn-${variant}`;
  
  const sizeStyles: Record<string, string> = {
    sm: 'padding: 8px 16px; font-size: 0.85rem;',
    md: '',
    lg: 'padding: 16px 32px; font-size: 1.05rem;',
  };

  return (
    <button
      className={`${variantClass} ${className}`}
      disabled={disabled || isLoading}
      style={{
        width: fullWidth ? '100%' : undefined,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        ...(size === 'sm' ? { padding: '8px 16px', fontSize: '0.85rem' } : {}),
        ...(size === 'lg' ? { padding: '16px 32px', fontSize: '1.05rem' } : {}),
      }}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
          <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
        </svg>
      )}
      <span>{children}</span>
    </button>
  );
}
