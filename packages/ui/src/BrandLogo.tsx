import React from 'react';
import { cn } from './utils.js';

export interface BrandLogoProps {
  variant?: 'default' | 'pay' | 'mobile' | 'chat';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'default',
  size = 'md',
  showText = true,
  className,
}) => {
  const sizeMap = {
    sm: { icon: 24, font: 'text-base', gap: 'gap-2' },
    md: { icon: 32, font: 'text-xl', gap: 'gap-2.5' },
    lg: { icon: 44, font: 'text-2xl', gap: 'gap-3' },
    xl: { icon: 56, font: 'text-4xl', gap: 'gap-4' },
  };

  const currentSize = sizeMap[size];

  // Identidade de cor do gradiente conforme variante
  const gradientColors = {
    default: { from: '#6366F1', mid: '#38BDF8', to: '#A855F7' },
    pay: { from: '#0284C7', mid: '#38BDF8', to: '#E0F2FE' },
    mobile: { from: '#4F46E5', mid: '#818CF8', to: '#C7D2FE' },
    chat: { from: '#8B5CF6', mid: '#A855F7', to: '#60A5FA' },
  }[variant];

  const subText = {
    default: 'ECOSYSTEM',
    pay: 'PAY',
    mobile: 'MOBILE',
    chat: 'CHAT',
  }[variant];

  return (
    <div className={cn('inline-flex items-center select-none', currentSize.gap, className)}>
      <svg
        width={currentSize.icon}
        height={currentSize.icon}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="transform transition-transform hover:scale-105 duration-300"
      >
        <defs>
          <linearGradient id={`nexa-grad-${variant}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={gradientColors.from} />
            <stop offset="50%" stopColor={gradientColors.mid} />
            <stop offset="100%" stopColor={gradientColors.to} />
          </linearGradient>
          <filter id={`nexa-glow-${variant}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Anel Prismatico NEXA com 3 Facetas Interconectadas */}
        <path
          d="M32 6L54 18V46L32 58L10 46V18L32 6Z"
          stroke={`url(#nexa-grad-${variant})`}
          strokeWidth="3.5"
          strokeLinejoin="round"
          className="opacity-90"
          filter={`url(#nexa-glow-${variant})`}
        />
        {/* Vórtice Central Refrativo */}
        <path
          d="M32 18L44 25V39L32 46L20 39V25L32 18Z"
          fill={`url(#nexa-grad-${variant})`}
          fillOpacity="0.25"
          stroke={`url(#nexa-grad-${variant})`}
          strokeWidth="2"
        />
        <circle cx="32" cy="32" r="4" fill="#FFFFFF" className="animate-pulse" />
      </svg>

      {showText && (
        <div className="flex flex-col leading-none">
          <span className={cn('font-bold tracking-tight text-white flex items-center', currentSize.font)}>
            NEXA
            {variant !== 'default' && (
              <span className="ml-1 text-sky-400 font-extrabold uppercase">{subText}</span>
            )}
          </span>
          {variant === 'default' && (
            <span className="text-[9px] tracking-[0.25em] text-slate-400 font-semibold mt-0.5">
              ECOSYSTEM
            </span>
          )}
        </div>
      )}
    </div>
  );
};
