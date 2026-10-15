import React from 'react';
import { GlassSurface, GlassButton } from '@nexa/ui';
import { ShieldCheck, Lock, MessageSquarePlus, Zap, Radio } from 'lucide-react';

interface EmptyChatStateProps {
  onStartNewChat: () => void;
}

export const EmptyChatState: React.FC<EmptyChatStateProps> = ({ onStartNewChat }) => {
  return (
    <div className="hidden md:flex flex-1 flex-col items-center justify-center p-8 bg-[#090D16]/50 relative overflow-hidden text-center">
      {/* Background glow */}
      <div className="absolute w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full relative z-10 flex flex-col items-center">
        {/* Animated Brand Badge */}
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-6 shadow-2xl shadow-emerald-950/50">
          <Radio className="w-10 h-10 animate-pulse" />
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-3">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Rede NEXA Mesh Ativa</span>
        </span>

        <h2 className="text-2xl font-bold font-display text-white mb-2">
          NEXA Chat Seguro
        </h2>

        <p className="text-sm text-slate-300 leading-relaxed mb-6">
          Selecione uma conversa ao lado para visualizar o histórico em tempo real ou inicie uma nova transmissão com qualquer linha virtual NEXA.
        </p>

        <div className="grid grid-cols-2 gap-3 w-full mb-6 text-left">
          <GlassSurface variant="card" className="p-3.5 rounded-2xl border border-white/5">
            <Lock className="w-4 h-4 text-emerald-400 mb-1.5" />
            <div className="text-xs font-semibold text-white">Posse Verificada</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Sem contas anônimas não autorizadas</div>
          </GlassSurface>

          <GlassSurface variant="card" className="p-3.5 rounded-2xl border border-white/5">
            <Zap className="w-4 h-4 text-teal-400 mb-1.5" />
            <div className="text-xs font-semibold text-white">WebRTC P2P</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Chamadas de alta definição sem intermediários</div>
          </GlassSurface>
        </div>

        <GlassButton
          variant="primary"
          onClick={onStartNewChat}
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium flex items-center gap-2 rounded-2xl shadow-lg shadow-emerald-950/40"
        >
          <MessageSquarePlus className="w-4 h-4" />
          <span>Iniciar Nova Conversa</span>
        </GlassButton>
      </div>
    </div>
  );
};
