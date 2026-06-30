'use client';

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
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
  const variantStyles: Record<string, string> = {
    primary: 'bg-accent-primary text-white hover:bg-accent-gradient-hover hover:shadow-sm active:translate-y-0 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none',
    secondary: 'bg-bg-secondary text-text-primary border border-border hover:bg-bg-tertiary hover:border-border-hover disabled:opacity-50 disabled:cursor-not-allowed',
    outline: 'bg-transparent text-accent-primary border-1.5 border-accent-primary hover:bg-accent-light hover:text-accent-secondary hover:border-accent-secondary disabled:border-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed',
    ghost: 'bg-transparent text-text-secondary hover:bg-bg-secondary hover:text-text-primary disabled:opacity-50 disabled:cursor-not-allowed',
    danger: 'bg-error text-white hover:bg-red-700 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed',
  };
  
  const sizeStyles: Record<string, string> = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3.5 text-base',
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 font-sans font-semibold rounded-lg transition-all duration-200 cursor-pointer ${variantStyles[variant]} ${sizeStyles[size]} ${widthClass} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin text-current" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
          <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
        </svg>
      )}
      <span>{children}</span>
    </button>
  );
}
