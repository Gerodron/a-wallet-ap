'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, ArrowLeft, X, Sparkles, HelpCircle, Wallet, Send, QrCode, History, Settings, ShieldCheck } from 'lucide-react';

interface TourStep {
  targetId: string;
  mobileTargetId?: string;
  title: string;
  icon: React.ElementType;
  description: string;
  position: 'bottom' | 'top' | 'left' | 'right' | 'center';
}

const TOUR_STEPS: TourStep[] = [
  {
    targetId: 'tour-step-balance',
    title: 'Tu Centro de Control Financiero',
    icon: Wallet,
    description: 'Aquí verás tu saldo total estimado. Usa el ícono del ojo para ocultarlo en público y el botón de recargar para actualizarlo en tiempo real.',
    position: 'bottom'
  },
  {
    targetId: 'tour-sidebar-send',
    mobileTargetId: 'tour-bottomnav-send',
    title: 'Realiza Transferencias',
    icon: Send,
    description: 'Dirígete aquí cuando necesites enviar criptomonedas a otra dirección. Nuestro sistema validará las direcciones automáticamente por seguridad.',
    position: 'right'
  },
  {
    targetId: 'tour-sidebar-receive',
    mobileTargetId: 'tour-bottomnav-receive',
    title: 'Recibe Activos',
    icon: QrCode,
    description: 'Obtén tu código QR o copia tu dirección pública exacta de la red activa para que otros te envíen fondos sin riesgo de pérdida.',
    position: 'right'
  },
  {
    targetId: 'tour-sidebar-history',
    mobileTargetId: 'tour-bottomnav-history',
    title: 'Registro y Trazabilidad',
    icon: History,
    description: 'Consulta todos tus ingresos, egresos y el estado en la blockchain de tus movimientos pasados en este módulo dedicado.',
    position: 'right'
  },
  {
    targetId: 'tour-sidebar-settings',
    mobileTargetId: 'tour-bottomnav-settings',
    title: 'Privacidad y Zona de Peligro',
    icon: Settings,
    description: 'Personaliza el cierre de sesión automático y gestiona la eliminación segura de tu billetera local si necesitas migrarla de navegador.',
    position: 'right'
  },
  {
    targetId: 'no-target',
    title: '100% No Custodial',
    icon: ShieldCheck,
    description: 'Recuerda: tus claves privadas nunca salen de tu dispositivo. Tú eres el único dueño de tus fondos. ¡Disfruta usando A-Wallet!',
    position: 'center'
  }
];

export function DashboardTour() {
  const [currentStepIndex, setCurrentStepIndex] = useState<number | null>(null);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const pulseRingRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const completed = localStorage.getItem('wallet-onboarding-completed');
      if (!completed) {
        const timer = setTimeout(() => {
          setCurrentStepIndex(0);
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  useEffect(() => {
    if (currentStepIndex === null) {
      cleanupActiveHighlights();
      return;
    }

    const step = TOUR_STEPS[currentStepIndex];
    const targetElement = document.getElementById(step.targetId) || 
                         (step.mobileTargetId ? document.getElementById(step.mobileTargetId) : null);

    cleanupActiveHighlights();

    if (targetElement) {
      targetElement.classList.add('tour-highlight-active');
      
      const ring = document.createElement('div');
      ring.className = 'tour-pulse-ring';
      targetElement.appendChild(ring);
      pulseRingRef.current = ring;

      targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });

      const updatePosition = () => {
        const rect = targetElement.getBoundingClientRect();
        const scrollY = window.scrollY;
        const scrollX = window.scrollX;
        
        const isMobile = window.innerWidth < 768;
        
        let newStyle: React.CSSProperties = {};
        
        if (isMobile || step.position === 'center') {
          newStyle = {
            position: 'fixed',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'calc(100% - 32px)',
            maxWidth: '380px',
            zIndex: 10005
          };
        } else {
          const offset = 12;
          switch (step.position) {
            case 'bottom':
              newStyle = {
                top: `${rect.bottom + scrollY + offset}px`,
                left: `${rect.left + scrollX + (rect.width / 2)}px`,
                transform: 'translateX(-50%)',
                zIndex: 10005
              };
              break;
            case 'top':
              newStyle = {
                top: `${rect.top + scrollY - offset}px`,
                left: `${rect.left + scrollX + (rect.width / 2)}px`,
                transform: 'translate(-50%, -100%)',
                zIndex: 10005
              };
              break;
            case 'left':
              newStyle = {
                top: `${rect.top + scrollY + (rect.height / 2)}px`,
                left: `${rect.left + scrollX - offset}px`,
                transform: 'translate( -100%, -50%)',
                zIndex: 10005
              };
              break;
            case 'right':
              newStyle = {
                top: `${rect.top + scrollY + (rect.height / 2)}px`,
                left: `${rect.right + scrollX + offset}px`,
                transform: 'translateY(-50%)',
                zIndex: 10005
              };
              break;
          }
        }
        setTooltipStyle(newStyle);
      };

      setTimeout(updatePosition, 100);
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition);
      return () => {
        window.removeEventListener('resize', updatePosition);
        window.removeEventListener('scroll', updatePosition);
      };
    } else {
      setTooltipStyle({
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 10005,
        width: 'calc(100% - 32px)',
        maxWidth: '400px'
      });
    }
  }, [currentStepIndex]);

  const cleanupActiveHighlights = () => {
    document.querySelectorAll('.tour-highlight-active').forEach((el) => {
      el.classList.remove('tour-highlight-active');
    });
    document.querySelectorAll('.tour-pulse-ring').forEach((el) => {
      el.remove();
    });
    pulseRingRef.current = null;
  };

  const handleNext = () => {
    if (currentStepIndex === null) return;
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStepIndex === null) return;
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    setCurrentStepIndex(null);
    if (typeof window !== 'undefined') {
      localStorage.setItem('wallet-onboarding-completed', 'true');
    }
  };

  const handleRestart = () => {
    setCurrentStepIndex(0);
  };

  if (currentStepIndex === null) {
    return (
      <button 
        onClick={handleRestart}
        className="fixed bottom-20 right-4 md:bottom-6 md:right-6 bg-bg-primary hover:bg-bg-secondary border border-border hover:border-accent-secondary text-text-secondary hover:text-accent-primary px-4 py-2.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all duration-200 shadow-md z-40 select-none cursor-pointer"
      >
        <HelpCircle size={14} />
        <span className="hidden sm:inline">Guía rápida</span>
      </button>
    );
  }

  const step = TOUR_STEPS[currentStepIndex];

  return (
    <>
      <div 
        className="fixed inset-0 bg-slate-900/60 z-[10000] backdrop-blur-xs transition-opacity duration-300 pointer-events-auto"
        onClick={handleSkip}
      />

      <div 
        style={tooltipStyle}
        className="p-5 md:p-6 rounded-xl border border-border-accent bg-bg-primary shadow-xl flex flex-col gap-4 animate-fade-in"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-accent-primary">
            <Sparkles size={16} className="text-accent-secondary" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-accent-secondary leading-none">
              Tutorial paso {currentStepIndex + 1} de {TOUR_STEPS.length}
            </span>
          </div>
          <button 
            onClick={handleSkip} 
            className="text-text-tertiary hover:text-text-primary transition-colors p-1 cursor-pointer"
            aria-label="Cerrar guia"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <step.icon size={18} className="text-accent-primary shrink-0" />
            <h4 className="text-sm font-bold text-text-primary tracking-tight">
              {step.title}
            </h4>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed pl-6">
            {step.description}
          </p>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-border mt-1 shrink-0">
          <button 
            onClick={handleSkip}
            className="text-xs text-text-tertiary hover:text-text-secondary font-semibold transition-colors cursor-pointer"
          >
            Saltar guía
          </button>
          
          <div className="flex items-center gap-2">
            {currentStepIndex > 0 && (
              <button 
                onClick={handleBack}
                className="btn-secondary py-1.5 px-3 rounded-lg flex items-center gap-1 text-xs"
              >
                <ArrowLeft size={12} />
                <span>Atrás</span>
              </button>
            )}
            <button 
              onClick={handleNext}
              className="btn-primary py-1.5 px-3 rounded-lg flex items-center gap-1 text-xs"
            >
              <span>{currentStepIndex === TOUR_STEPS.length - 1 ? 'Finalizar' : 'Siguiente'}</span>
              <ArrowRight size={12} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
