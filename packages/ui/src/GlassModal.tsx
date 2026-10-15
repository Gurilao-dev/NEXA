import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { GlassSurface } from './GlassSurface.js';
import { cn } from './utils.js';

export interface GlassModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  children: React.ReactNode;
}

export const GlassModal: React.FC<GlassModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  maxWidth = 'md',
  children,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  }[maxWidth];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
      />

      {/* Modal Content */}
      <GlassSurface
        variant="card"
        glow={true}
        className={cn(
          'relative w-full z-10 p-6 sm:p-8 flex flex-col gap-5',
          'animate-in zoom-in-95 duration-200',
          maxWidthStyles
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            {title && <h2 className="text-xl font-bold text-white tracking-tight">{title}</h2>}
            {subtitle && <p className="text-sm text-slate-400">{subtitle}</p>}
          </div>

          <button
            onClick={onClose}
            aria-label="Fechar modal"
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div>{children}</div>
      </GlassSurface>
    </div>
  );
};
