'use client';

import React from 'react';
import { NetworkType } from '@/lib/types/wallet';
import { NETWORK_CONFIGS } from '@/lib/types/network';
import { useWallet } from '@/lib/hooks/useWallet';
import { Check, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export function NetworkSelector() {
  const { activeNetwork, setActiveNetwork } = useWallet();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const networks = Object.keys(NETWORK_CONFIGS) as NetworkType[];

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeConfig = NETWORK_CONFIGS[activeNetwork];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-bg-tertiary border border-border hover:border-border-hover text-text-primary text-sm font-medium transition-all duration-200"
      >
        <span 
          className="w-2.5 h-2.5 rounded-full shrink-0 animate-pulse" 
          style={{ backgroundColor: activeConfig.color }}
        />
        <span>{activeConfig.name}</span>
        <ChevronDown size={14} className="text-text-secondary" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl bg-secondary border border-border shadow-2xl p-1.5 z-50 animate-fade-in">
          <div className="text-[10px] text-text-secondary font-semibold font-sans px-3 py-1.5 uppercase tracking-wider">
            Seleccionar Red
          </div>
          {networks.map((network) => {
            const config = NETWORK_CONFIGS[network];
            const isSelected = network === activeNetwork;
            return (
              <button
                key={network}
                onClick={() => {
                  setActiveNetwork(network);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left text-sm transition-all duration-200 hover:bg-bg-tertiary
                  ${isSelected ? 'bg-bg-tertiary text-accent-primary font-medium' : 'text-text-primary'}`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-base font-mono" style={{ color: config.color }}>{config.icon}</span>
                  <div className="flex flex-col">
                    <span className="text-text-primary">{config.name}</span>
                    <span className="text-[10px] text-text-secondary">{config.symbol}</span>
                  </div>
                </div>
                {isSelected && <Check size={16} className="text-accent-primary" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
