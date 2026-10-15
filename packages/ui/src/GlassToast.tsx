import React from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { GlassSurface } from './GlassSurface.js';
import { cn } from './utils.js';

export interface GlassToastProps {
  type?: 'success' | 'error' | 'info' | 'warning';
  title?: string;
  message: string;
  onDismiss?: () => void;
  className?: string;
}

export const GlassToast: React.FC<GlassToastProps> = ({
  type = 'info',
  title,
  message,
  onDismiss,
  className,
}) => {
  const iconMap = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
    info: <Info className="w-5 h-5 text-sky-400 shrink-0" />,
  };

  return (
    <GlassSurface
      variant="dense"
      blur="lg"
      role="status"
      aria-live="polite"
      className={cn(
        'p-4 flex items-start gap-3.5 max-w-sm rounded-2xl border border-white/25 shadow-2xl shadow-black/40',
        'animate-in slide-in-from-top-4 duration-300',
        className
      )}
    >
      <div className="mt-0.5">{iconMap[type]}</div>

      <div className="flex-1 flex flex-col gap-0.5">
        {title && <h4 className="text-sm font-semibold text-white tracking-tight">{title}</h4>}
        <p className="text-xs text-slate-200 leading-relaxed">{message}</p>
      </div>

      {onDismiss && (
        <button
          onClick={onDismiss}
          aria-label="Dispensar aviso"
          className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors hover:bg-white/10"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </GlassSurface>
  );
};
