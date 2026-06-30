'use client';

import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export function Input({
  label,
  error,
  helperText,
  icon,
  rightElement,
  className = '',
  id,
  ...props
}: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  const paddingLeftClass = icon ? 'pl-11' : '';
  const paddingRightClass = rightElement ? 'pr-11' : '';
  const baseInputClass = "bg-bg-input border-1.5 border-border rounded-xl py-3 px-4 text-text-primary text-sm transition-all duration-200 outline-none focus:border-accent-secondary focus:ring-3 focus:ring-accent-secondary/12 disabled:bg-bg-secondary disabled:text-text-secondary disabled:cursor-not-allowed placeholder:text-text-tertiary w-full";
  const errorClass = error ? 'border-error! focus:border-error! focus:ring-error-dim!' : '';

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="text-[12px] font-bold text-text-secondary tracking-wide select-none"
        >
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && (
          <div className="absolute left-3.5 text-text-tertiary flex items-center pointer-events-none">
            {icon}
          </div>
        )}
        <input
          id={inputId}
          className={`${baseInputClass} ${paddingLeftClass} ${paddingRightClass} ${errorClass} ${className}`}
          {...props}
        />
        {rightElement && (
          <div className="absolute right-3.5 text-text-tertiary flex items-center">
            {rightElement}
          </div>
        )}
      </div>
      {error && (
        <span className="text-[11px] font-semibold text-error mt-0.5 animate-fade-in">{error}</span>
      )}
      {helperText && !error && (
        <span className="text-[11px] text-text-tertiary mt-0.5">{helperText}</span>
      )}
    </div>
  );
}
