import React from 'react';
import { GlassSurface, GlassButton } from '@nexa/ui';
import { ShieldAlert, Smartphone, ArrowRight, ExternalLink, RefreshCw } from 'lucide-react';

interface NoNumbersGateProps {
  onRefresh: () => void;
  loading: boolean;
}

export const NoNumbersGate: React.FC<NoNumbersGateProps> = ({ onRefresh, loading }) => {
  const mobileCatalogUrl = import.meta.env.VITE_MOBILE_URL || 'http://localhost:5174/catalog';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl">
      <GlassSurface
        variant="card"
        className="max-w-lg w-full p-6 sm:p-8 rounded-3xl border border-emerald-500/30 shadow-2xl shadow-emerald-950/40 text-center"
      >
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/10 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-3 uppercase tracking-wider">
          Acesso Restrito ao Ecossistema
        </span>

        <h2 className="text-2xl font-bold font-display text-white mb-3">
          Linha Virtual NEXA Obrigatória
        </h2>

        <p className="text-sm text-slate-300 leading-relaxed mb-6">
          O <strong>NEXA Chat</strong> é uma rede privada onde cada participante é autenticado exclusivamente pela posse criptográfica de uma linha virtual ativa da <strong>NEXA Mobile</strong>.
        </p>

        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-left mb-6 text-xs text-slate-300 space-y-2">
          <div className="flex items-start gap-2.5">
            <Smartphone className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
            <span>
              <strong>Identidade Segura:</strong> Seu número virtual atua como sua chave de roteamento, impedindo spam e contas robóticas.
            </span>
          </div>
          <div className="flex items-start gap-2.5">
            <ExternalLink className="w-4 h-4 text-teal-400 mt-0.5 shrink-0" />
            <span>
              <strong>Simulação Gratuita:</strong> Você pode obter sua linha em segundos na NEXA Mobile usando os R$ 300,00 concedidos na NEXA Pay.
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href={mobileCatalogUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto flex-1"
          >
            <GlassButton variant="primary" className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium flex items-center justify-center gap-2">
              <span>Obter Linha na NEXA Mobile</span>
              <ArrowRight className="w-4 h-4" />
            </GlassButton>
          </a>

          <GlassButton
            variant="ghost"
            onClick={onRefresh}
            disabled={loading}
            className="w-full sm:w-auto px-4 py-3 text-slate-300 hover:text-white flex items-center justify-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
            <span>{loading ? 'Verificando...' : 'Já Adquiri, Verificar'}</span>
          </GlassButton>
        </div>
      </GlassSurface>
    </div>
  );
};
