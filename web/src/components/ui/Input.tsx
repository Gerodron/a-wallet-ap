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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
      {label && (
        <label
          htmlFor={inputId}
          style={{
            fontSize: '0.85rem',
            fontWeight: 500,
            color: 'var(--text-secondary)',
            letterSpacing: '0.01em',
          }}
        >
          {label}
        </label>
      )}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {icon && (
          <div style={{
            position: 'absolute',
            left: '14px',
            color: 'var(--text-tertiary)',
            display: 'flex',
            alignItems: 'center',
          }}>
            {icon}
          </div>
        )}
        <input
          id={inputId}
          className={`input-field ${className}`}
          style={{
            paddingLeft: icon ? '42px' : undefined,
            paddingRight: rightElement ? '42px' : undefined,
            borderColor: error ? 'var(--error)' : undefined,
          }}
          {...props}
        />
        {rightElement && (
          <div style={{
            position: 'absolute',
            right: '14px',
            color: 'var(--text-tertiary)',
            display: 'flex',
            alignItems: 'center',
          }}>
            {rightElement}
          </div>
        )}
      </div>
      {error && (
        <span style={{ fontSize: '0.8rem', color: 'var(--error)' }}>{error}</span>
      )}
      {helperText && !error && (
        <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>{helperText}</span>
      )}
    </div>
  );
}
