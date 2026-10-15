import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from './utils.js';

export interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'glass' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  variant = 'glass',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  className,
  children,
  ...props
}) => {
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs rounded-xl gap-1.5',
    md: 'px-5 py-2.5 text-sm rounded-2xl gap-2',
    lg: 'px-7 py-3.5 text-base rounded-2xl gap-2.5 font-medium',
  }[size];

  const variantStyles = {
    primary:
      'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-lg shadow-sky-500/25 hover:from-sky-400 hover:to-indigo-500 border border-white/20',
    secondary:
      'bg-white/10 dark:bg-white/5 text-white hover:bg-white/20 border border-white/15 backdrop-blur-md',
    glass:
      'bg-white/[0.14] dark:bg-slate-900/[0.45] text-white backdrop-blur-xl border border-white/25 hover:bg-white/[0.22] hover:border-white/40 shadow-xl shadow-black/20',
    danger:
      'bg-gradient-to-r from-rose-600 to-red-600 text-white hover:from-rose-500 hover:to-red-500 border border-white/20 shadow-lg shadow-rose-600/25',
    ghost:
      'bg-transparent text-slate-300 hover:text-white hover:bg-white/10 border border-transparent',
  }[variant];

  return (
    <button
      disabled={disabled || loading}
      className={cn(
        'relative inline-flex items-center justify-center select-none font-medium',
        'transition-all duration-200 ease-out',
        'hover:scale-[1.02] active:scale-[0.98]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
        'disabled:opacity-50 disabled:pointer-events-none disabled:transform-none',
        sizeStyles,
        variantStyles,
        className
      )}
      {...props}
    >
      {/* Specular gleam */}
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none"
      />

      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : (
        icon && <span className="inline-flex shrink-0">{icon}</span>
      )}
      {children}
    </button>
  );
};
