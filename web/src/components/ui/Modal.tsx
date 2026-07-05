'use client';

import React, { useEffect, useCallback } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleEscape]);

  if (!isOpen) return null;

  const sizeMap: Record<string, string> = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />
      
      <div
        className={`relative w-full ${sizeMap[size]} bg-bg-elevated border border-border rounded-xl shadow-xl flex flex-col max-h-[90vh] overflow-hidden animate-fade-in-up p-6 md:p-8 z-10`}
      >
        <div className="flex items-center justify-between border-b border-border pb-3.5 mb-5 shrink-0">
          {title ? (
            <h2 className="text-lg font-bold text-text-primary tracking-tight">
              {title}
            </h2>
          ) : (
            <div />
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-secondary border border-transparent hover:border-border transition-all duration-200 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-accent-secondary"
            aria-label="Cerrar modal"
          >
            <X size={18} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto pr-1 -mr-1">
          {children}
        </div>
      </div>
    </div>
  );
}
