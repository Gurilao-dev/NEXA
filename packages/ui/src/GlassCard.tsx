import React from 'react';
import { GlassSurface } from './GlassSurface.js';
import { cn } from './utils.js';

export interface GlassCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  badge?: React.ReactNode;
  action?: React.ReactNode;
  footer?: React.ReactNode;
  glow?: boolean;
  interactive?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  title,
  subtitle,
  badge,
  action,
  footer,
  glow = false,
  interactive = false,
  className,
  children,
  ...props
}) => {
  const hasHeader = title || subtitle || badge || action;

  return (
    <GlassSurface
      variant="card"
      glow={glow}
      interactive={interactive}
      className={cn('p-6 flex flex-col gap-4', className)}
      {...props}
    >
      {hasHeader && (
        <div className="flex items-start justify-between gap-4 pb-2 border-b border-white/[0.08]">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              {title && <h3 className="text-lg font-semibold text-white tracking-tight">{title}</h3>}
              {badge && <span>{badge}</span>}
            </div>
            {subtitle && <p className="text-sm text-slate-400 leading-relaxed">{subtitle}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}

      <div className="flex-1 text-slate-200">{children}</div>

      {footer && (
        <div className="pt-3 mt-auto border-t border-white/[0.08] text-sm text-slate-400">
          {footer}
        </div>
      )}
    </GlassSurface>
  );
};
