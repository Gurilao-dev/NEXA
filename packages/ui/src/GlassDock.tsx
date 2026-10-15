import React from 'react';
import { GlassSurface } from './GlassSurface.js';
import { cn } from './utils.js';

export interface DockItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: number | string;
  onClick?: () => void;
  active?: boolean;
}

export interface GlassDockProps {
  items: DockItem[];
  activeId?: string;
  onSelect?: (id: string) => void;
  className?: string;
}

export const GlassDock: React.FC<GlassDockProps> = ({
  items,
  activeId,
  onSelect,
  className,
}) => {
  return (
    <GlassSurface
      variant="dense"
      blur="hero"
      glow={true}
      className={cn(
        'inline-flex items-center gap-1.5 p-2 rounded-full border border-white/25 shadow-2xl shadow-black/40',
        className
      )}
    >
      {items.map((item) => {
        const isActive = activeId ? item.id === activeId : item.active;

        return (
          <button
            key={item.id}
            onClick={() => {
              item.onClick?.();
              onSelect?.(item.id);
            }}
            className={cn(
              'relative flex flex-col items-center justify-center px-4 py-2 rounded-full transition-all duration-300',
              'hover:scale-105 active:scale-95 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400',
              isActive
                ? 'bg-gradient-to-r from-sky-500/80 to-indigo-600/80 text-white shadow-lg shadow-sky-500/30'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            )}
          >
            <div className="relative flex items-center justify-center">
              {item.icon}
              {item.badge !== undefined && (
                <span className="absolute -top-1 -right-2 bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ring-2 ring-slate-900 leading-none">
                  {item.badge}
                </span>
              )}
            </div>
            <span className="text-[11px] font-medium tracking-tight mt-1">{item.label}</span>
          </button>
        );
      })}
    </GlassSurface>
  );
};
