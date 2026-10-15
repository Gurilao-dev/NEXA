import React from 'react';
import { GlassButton } from '@nexa/ui';
import { ArrowRight, Sparkles, Smartphone, Shield, Zap } from 'lucide-react';

interface HeroSceneProps {
  onExplore: () => void;
}

export const HeroScene: React.FC<HeroSceneProps> = ({ onExplore }) => {
  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden py-16">
      {/* Luzes Volumétricas de Fundo */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-indigo-500/20 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute top-1/3 -right-32 w-96 h-96 bg-sky-500/20 rounded-full blur-[128px] pointer-events-none" />

      {/* Selo Cinematográfico */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.06] border border-white/15 text-xs text-indigo-300 font-semibold mb-6 backdrop-blur-md animate-in fade-in slide-in-from-bottom-3 duration-500">
        <Sparkles className="w-3.5 h-3.5 text-sky-400" />
        <span>O Futuro da Identidade Digital e Mensageria</span>
      </div>

      {/* Tipografia de Destaque Hero */}
      <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white tracking-tight max-w-4xl font-display leading-[1.08] mb-6">
        Sua Linha Virtual.{' '}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-300 to-purple-400">
          Cinematográfica.
        </span>{' '}
        Exclusiva.
      </h1>

      <p className="text-base sm:text-xl text-slate-300 max-w-2xl leading-relaxed mb-10 font-normal">
        Adquira números virtuais no namespace exclusivo NEXA com créditos fictícios da NEXA Pay e desbloqueie conversas e chamadas WebRTC em alta fidelidade.
      </p>

      {/* Botões de Ação */}
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-16 z-10">
        <GlassButton
          variant="primary"
          size="lg"
          onClick={onExplore}
          icon={<ArrowRight className="w-4 h-4" />}
          className="text-base px-8 py-4 shadow-2xl shadow-indigo-500/30"
        >
          Escolher Meu Número
        </GlassButton>

        <a
          href="#como-funciona"
          className="px-6 py-4 rounded-2xl bg-white/[0.06] hover:bg-white/10 text-slate-200 text-sm font-medium border border-white/10 transition-all backdrop-blur-md"
        >
          Conhecer a Narrativa
        </a>
      </div>

      {/* Mockup 3D Original de Smartphone em CSS/SVG com Chip Holográfico Suspenso */}
      <div className="relative w-full max-w-xs sm:max-w-sm h-80 sm:h-96 flex items-center justify-center perspective-[1000px]">
        {/* Corpo do Smartphone com Reflexos */}
        <div className="relative w-56 sm:w-64 h-full rounded-[44px] bg-slate-900 border-4 border-slate-700/80 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] p-3 flex flex-col justify-between transform rotate-[-6deg] hover:rotate-0 transition-transform duration-700">
          {/* Notch / Dynamic Island */}
          <div className="w-20 h-4 bg-slate-950 rounded-full mx-auto" />

          {/* Tela Glass com Interface do Chip Flutuante */}
          <div className="flex-1 rounded-[34px] bg-gradient-to-b from-slate-950 via-indigo-950/60 to-slate-950 border border-white/10 flex flex-col items-center justify-center p-4 my-2 relative overflow-hidden">
            <div className="absolute inset-0 bg-radial-gradient from-indigo-500/10 to-transparent" />

            {/* Cartão Holográfico do Número Virtual */}
            <div className="w-full p-4 rounded-2xl bg-white/[0.12] border border-white/30 backdrop-blur-xl shadow-xl flex flex-col gap-2 transform translate-y-[-10px] animate-pulse">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-sky-400 tracking-wider">NEXA SIM</span>
                <Zap className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <span className="font-mono text-sm font-extrabold text-white tracking-tight">
                +55 (11) 98888-0001
              </span>
              <span className="text-[9px] text-slate-400">Identidade Digital Ativa</span>
            </div>

            <div className="mt-4 flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
              <Shield className="w-3.5 h-3.5" />
              <span>Conexão Criptografada</span>
            </div>
          </div>

          <div className="w-28 h-1 bg-white/20 rounded-full mx-auto mb-1" />
        </div>
      </div>
    </section>
  );
};
