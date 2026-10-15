import React from 'react';
import { cn } from './utils.js';

export interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const GlassInput = React.forwardRef<HTMLInputElement, GlassInputProps>(
  ({ label, error, hint, leftIcon, rightIcon, className, id, ...props }, ref) => {
    const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label htmlFor={inputId} className="text-xs font-medium text-slate-300 select-none">
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 text-slate-400 pointer-events-none flex items-center">
              {leftIcon}
            </div>
          )}

          <input
            id={inputId}
            ref={ref}
            className={cn(
              'w-full bg-white/[0.08] dark:bg-slate-900/[0.60] text-white placeholder-slate-400',
              'backdrop-blur-md border border-white/[0.18] rounded-xl px-4 py-2.5 text-sm',
              'transition-all duration-200 outline-none',
              'focus:border-sky-400 focus:bg-white/[0.14] focus:ring-2 focus:ring-sky-400/25',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              error && 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/25',
              className
            )}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-3.5 text-slate-400 flex items-center">
              {rightIcon}
            </div>
          )}
        </div>

        {error && <span className="text-xs text-rose-400 mt-0.5">{error}</span>}
        {!error && hint && <span className="text-xs text-slate-400 mt-0.5">{hint}</span>}
      </div>
    );
  }
);

GlassInput.displayName = 'GlassInput';
