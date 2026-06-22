'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, ArrowLeft, X, Sparkles, HelpCircle } from 'lucide-react';

interface TourStep {
  targetId: string;
  title: string;
  description: string;
  position: 'bottom' | 'top' | 'left' | 'right' | 'center';
}

const TOUR_STEPS: TourStep[] = [
  {
    targetId: 'tour-step-balance',
    title: '👋 ¡Hola! Este es tu Balance Principal',
    description: 'Aquí verás tu dinero total disponible estimado en tiempo real de todas tus redes activas.',
    position: 'bottom'
  },
  {
    targetId: 'tour-step-receive',
    title: '⬇️ Recibe Fondos fácilmente',
    description: 'Usa este botón para ver tu código QR o copiar tu dirección pública para recibir transferencias.',
    position: 'top'
  },
  {
    targetId: 'tour-step-send',
    title: '⬆️ Envía Criptomonedas de forma segura',
    description: 'Transfiere fondos a otras cuentas de forma rápida ingresando la dirección de destino o escaneando su QR.',
    position: 'top'
  },
  {
    targetId: 'tour-step-history',
    title: '📊 Historial de Actividad',
    description: 'Monitorea tus ingresos, egresos y el estado detallado de tus transacciones en esta sección.',
    position: 'top'
  }
];

export function DashboardTour() {
  const [currentStepIndex, setCurrentStepIndex] = useState<number | null>(null);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const pulseRingRef = useRef<HTMLDivElement | null>(null);

  // Check if onboarding completed
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const completed = localStorage.getItem('wallet-onboarding-completed');
      if (!completed) {
        // Start tour after a short delay
        const timer = setTimeout(() => {
          setCurrentStepIndex(0);
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  // Update highlight and tooltip position when step changes
  useEffect(() => {
    if (currentStepIndex === null) {
      cleanupActiveHighlights();
      return;
    }

    const step = TOUR_STEPS[currentStepIndex];
    const targetElement = document.getElementById(step.targetId);

    cleanupActiveHighlights();

    if (targetElement) {
      // Add highlight class
      targetElement.classList.add('tour-highlight-active');
      
      // Inject pulse ring
      const ring = document.createElement('div');
      ring.className = 'tour-pulse-ring';
      targetElement.appendChild(ring);
      pulseRingRef.current = ring;

      // Scroll into view gently
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // Compute position
      const updatePosition = () => {
        const rect = targetElement.getBoundingClientRect();
        const scrollY = window.scrollY;
        const scrollX = window.scrollX;
        
        const isMobile = window.innerWidth < 768;
        
        let newStyle: React.CSSProperties = {};
        
        if (isMobile || step.position === 'center') {
          // Centered at bottom for mobile screens
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
          // Desktop relative positioning
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

      // Run and add listener
      setTimeout(updatePosition, 100); // Wait for scroll/render
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition);
      return () => {
        window.removeEventListener('resize', updatePosition);
        window.removeEventListener('scroll', updatePosition);
      };
    } else {
      // Target element not found, fallback to center modal
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
    // Remove tour classes from all elements
    document.querySelectorAll('.tour-highlight-active').forEach((el) => {
      el.classList.remove('tour-highlight-active');
    });
    // Remove existing pulse rings
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
    // Return a subtle help button to restart guide anytime
    return (
      <button 
        onClick={handleRestart}
        className="fixed bottom-20 right-4 md:bottom-6 md:right-6 bg-bg-tertiary hover:bg-bg-elevated border border-border hover:border-accent-primary text-text-secondary hover:text-accent-primary px-3 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all duration-300 shadow-lg z-40 select-none"
      >
        <HelpCircle size={14} />
        <span className="hidden sm:inline">Guia rapida</span>
      </button>
    );
  }

  const step = TOUR_STEPS[currentStepIndex];

  return (
    <>
      {/* Backdrop overlay */}
      <div 
        className="fixed inset-0 bg-[#030307]/80 z-[10000] backdrop-blur-[2px] transition-opacity duration-300 pointer-events-auto"
        onClick={handleSkip}
      />

      {/* Interactive Tooltip Card */}
      <div 
        style={tooltipStyle}
        className="glass-card-accent p-5 md:p-6 border border-accent-primary/40 bg-bg-secondary/95 shadow-[0_12px_40px_rgba(0,217,255,0.15)] flex flex-col gap-4 animate-fade-in"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-accent-primary">
            <Sparkles size={16} className="animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-accent-primary/80">
              Tutorial paso {currentStepIndex + 1} de {TOUR_STEPS.length}
            </span>
          </div>
          <button 
            onClick={handleSkip} 
            className="text-text-tertiary hover:text-text-primary transition-colors p-1"
            aria-label="Cerrar guia"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-1.5">
          <h4 className="text-sm font-bold text-text-primary tracking-wide">
            {step.title}
          </h4>
          <p className="text-xs text-text-secondary leading-relaxed">
            {step.description}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-border mt-1">
          <button 
            onClick={handleSkip}
            className="text-xs text-text-tertiary hover:text-text-secondary font-medium transition-colors"
          >
            Saltar guia
          </button>
          
          <div className="flex items-center gap-2">
            {currentStepIndex > 0 && (
              <button 
                onClick={handleBack}
                className="btn-secondary py-1.5 px-3 rounded-lg flex items-center gap-1 text-xs"
              >
                <ArrowLeft size={12} />
                <span>Atras</span>
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
