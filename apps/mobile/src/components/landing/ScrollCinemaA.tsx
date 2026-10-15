import React, { useState } from 'react';
import { GlassSurface } from '@nexa/ui';
import { Cpu, Wifi, Sparkles, ShieldCheck } from 'lucide-react';

export const ScrollCinemaA: React.FC = () => {
  const [progress, setProgress] = useState(75);

  return (
    <section className="py-20 px-4 max-w-5xl mx-auto flex flex-col items-center text-center">
      <div className="flex flex-col gap-3 max-w-2xl mb-12">
        <span className="text-xs font-bold uppercase tracking-widest text-sky-400">
          Scroll-Cinema 01
        </span>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-display">
          O Nascimento de um Número
        </h2>
        <p className="text-sm text-slate-300 leading-relaxed">
          Arraste o controle para simular as camadas de silício virtual, criptografia e alocação no namespace que sintetizam sua nova linha digital.
        </p>
      </div>

      {/* Controle Interativo de Montagem */}
      <div className="w-full max-w-md flex flex-col gap-2 mb-8">
        <div className="flex justify-between text-xs font-semibold text-slate-400">
          <span>Camada Física</span>
          <span className="text-sky-400 font-mono">{progress}% Sintetizado</span>
          <span>Linha Ativa</span>
        </div>
        <input
          type="range"
          min="10"
          max="100"
          value={progress}
          onChange={(e) => setProgress(Number(e.target.value))}
          className="w-full accent-sky-400 h-2 bg-white/10 rounded-lg cursor-pointer"
        />
      </div>

      {/* Holograma em Montagem Reativa */}
      <div className="relative w-full max-w-lg h-72 flex items-center justify-center">
        {/* Camada 1: Circuito Base */}
        <div
          style={{ opacity: progress / 100, transform: `scale(${0.8 + (progress / 100) * 0.2})` }}
          className="absolute inset-0 rounded-3xl bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-sky-900/40 border border-white/20 backdrop-blur-2xl p-8 flex flex-col justify-between shadow-2xl transition-all duration-300"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sky-400">
              <Cpu className="w-6 h-6 animate-pulse" />
              <span className="font-mono text-xs uppercase tracking-widest">NEXA Core v1</span>
            </div>
            <Wifi className="w-5 h-5 text-indigo-400" />
          </div>

          <div className="flex flex-col items-start text-left">
            <span className="text-xs text-slate-400 uppercase tracking-widest">Identificador Virtual</span>
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-white tracking-wider">
              {progress > 50 ? '+55 (11) 98765-4321' : '+55 (11) •••••-••••'}
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-3 border-t border-white/10">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{progress === 100 ? 'Provisionamento Pronto' : 'Alocando Registro'}</span>
            </div>
            <span className="font-mono">Namespace Seguro</span>
          </div>
        </div>
      </div>
    </section>
  );
};
