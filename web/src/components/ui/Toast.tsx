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

  const dismiss = () => {
    setIsExiting(true);
    setTimeout(() => onDismiss(toast.id), 300);
  };

  useEffect(() => {
    const duration = toast.duration || 5000;
    const timer = setTimeout(dismiss, duration);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast]);

  const icons = {
    success: <CheckCircle size={17} className="text-emerald-500 shrink-0" />,
    error:   <XCircle    size={17} className="text-red-500    shrink-0" />,
    warning: <AlertTriangle size={17} className="text-amber-500  shrink-0" />,
    info:    <Info       size={17} className="text-blue-500   shrink-0" />,
  };

  const accent = {
    success: 'border-l-emerald-500',
    error:   'border-l-red-500',
    warning: 'border-l-amber-500',
    info:    'border-l-blue-500',
  };

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`
        flex items-start gap-3 p-3.5 pr-3 rounded-xl
        border border-border border-l-4 ${accent[toast.type]}
        bg-bg-elevated shadow-lg
        min-w-[300px] max-w-[400px]
        transition-all duration-300
        ${isExiting ? 'animate-toast-out' : 'animate-toast-in'}
      `}
    >
      <div className="mt-0.5">{icons[toast.type]}</div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-text-primary leading-snug">{toast.title}</p>
        {toast.message && (
          <p className="text-xs text-text-secondary mt-0.5 leading-normal">{toast.message}</p>
        )}
      </div>

      <button
        onClick={dismiss}
        className="p-1 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-bg-secondary transition-all duration-150 cursor-pointer shrink-0 mt-0.5"
        aria-label="Cerrar notificación"
      >
        <X size={13} />
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
    <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2.5 pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem toast={t} onDismiss={onDismiss} />
        </div>
      ))}
    </div>
  );
}
