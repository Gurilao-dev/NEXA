import React from 'react';
import { BrandLogo, GlassButton } from '@nexa/ui';
import { HelpCircle, AlertTriangle, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  guestUid?: string;
  onOpenHelp: () => void;
}

export const Header: React.FC<HeaderProps> = ({ guestUid, onOpenHelp }) => {
  return (
    <header className="w-full flex flex-col sticky top-0 z-40 backdrop-blur-xl bg-slate-950/70 border-b border-white/[0.08]">
      {/* Banner de Aviso de Simulação Indelével */}
      <div className="bg-gradient-to-r from-amber-500/20 via-sky-500/20 to-amber-500/20 border-b border-amber-500/30 px-4 py-1.5 text-center flex items-center justify-center gap-2 text-xs font-semibold text-amber-300">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span>AMBIENTE DE SIMULAÇÃO — CRÉDITOS VIRTUAIS SEM VALOR MONETÁRIO REAL</span>
      </div>

      <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-3.5 flex items-center justify-between">
        <BrandLogo variant="pay" size="md" />

        <div className="flex items-center gap-3">
          {guestUid && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.06] border border-white/10 text-xs text-slate-300 font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
              <span>Sessão: {guestUid.substring(0, 10)}...</span>
            </div>
          )}

          <GlassButton
            variant="ghost"
            size="sm"
            icon={<HelpCircle className="w-4 h-4 text-sky-400" />}
            onClick={onOpenHelp}
          >
            Como Funciona
          </GlassButton>
        </div>
      </div>
    </header>
  );
};
