import React from 'react';
import { cn } from './utils.js';

export interface GlassSurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType;
  variant?: 'clear' | 'regular' | 'dense' | 'card';
  blur?: 'sm' | 'md' | 'lg' | 'hero';
  glow?: boolean;
  specular?: boolean;
  interactive?: boolean;
}

export const GlassSurface: React.FC<GlassSurfaceProps> = ({
  as: Component = 'div',
  variant = 'regular',
  blur = 'md',
  glow = false,
  specular = true,
  interactive = false,
  className,
  children,
  ...props
}) => {
  const variantStyles = {
    clear: 'bg-white/[0.06] dark:bg-slate-950/[0.25] text-slate-100',
    regular: 'bg-white/[0.12] dark:bg-slate-900/[0.45] text-slate-100',
    dense: 'bg-white/[0.22] dark:bg-slate-900/[0.75] text-white',
    card: 'bg-slate-900/[0.80] dark:bg-slate-950/[0.85] text-slate-100 border-white/[0.14]',
  }[variant];

  const blurStyles = {
    sm: 'backdrop-blur-sm',
    md: 'backdrop-blur-md',
    lg: 'backdrop-blur-xl',
    hero: 'backdrop-blur-2xl',
  }[blur];

  const specularBorder = specular
    ? 'border border-white/[0.18] dark:border-white/[0.12] shadow-[inset_0_1px_1px_rgba(255,255,255,0.25)]'
    : 'border border-transparent';

  const glowStyles = glow ? 'shadow-[0_0_35px_rgba(99,102,241,0.22)]' : 'shadow-2xl shadow-black/30';

  const interactiveStyles = interactive
    ? 'cursor-pointer transition-all duration-300 hover:scale-[1.01] hover:bg-white/[0.16] hover:border-white/30 active:scale-[0.99]'
    : '';

  return (
    <Component
      className={cn(
        'relative rounded-2xl overflow-hidden',
        variantStyles,
        blurStyles,
        specularBorder,
        glowStyles,
        interactiveStyles,
        className
      )}
      {...props}
    >
      {/* Caustic Specular Rim Highlight */}
      {specular && (
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none"
        />
      )}
      {children}
    </Component>
  );
};
