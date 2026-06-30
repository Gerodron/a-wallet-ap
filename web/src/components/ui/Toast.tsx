'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

export interface ToastData {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

interface ToastProps {
  toast: ToastData;
  onDismiss: (id: string) => void;
}

function ToastItem({ toast, onDismiss }: ToastProps) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const duration = toast.duration || 5000;
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => onDismiss(toast.id), 300);
    }, duration);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  const icons = {
    success: <CheckCircle size={18} className="text-success" />,
    error: <XCircle size={18} className="text-error" />,
    warning: <AlertTriangle size={18} className="text-warning" />,
    info: <Info size={18} className="text-accent-secondary" />,
  };

  const borderColors = {
    success: 'border-l-success',
    error: 'border-l-error',
    warning: 'border-l-warning',
    info: 'border-l-accent-secondary',
  };

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-xl border border-border bg-bg-elevated shadow-md min-w-[320px] max-w-[420px] transition-all duration-300 border-l-4 ${borderColors[toast.type]} ${
        isExiting ? 'opacity-0 translate-x-full' : 'animate-slide-in-right'
      }`}
    >
      <div className="shrink-0 mt-0.5">{icons[toast.type]}</div>
      <div className="flex-1">
        <div className="text-sm font-bold text-text-primary leading-tight">
          {toast.title}
        </div>
        {toast.message && (
          <div className="text-xs text-text-secondary mt-1 leading-normal">
            {toast.message}
          </div>
        )}
      </div>
      <button
        onClick={() => {
          setIsExiting(true);
          setTimeout(() => onDismiss(toast.id), 300);
        }}
        className="p-1 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-bg-secondary transition-all cursor-pointer shrink-0"
        aria-label="Cerrar notificación"
      >
        <X size={14} />
      </button>
    </div>
  );
}

interface ToastContainerProps {
  toasts: ToastData[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}
