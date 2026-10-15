import React from 'react';
import { useAuth } from '../context/AuthContext.js';
import { GlassCard, GlassButton } from '@nexa/ui';
import { User, ShieldCheck, Download, LogOut, CheckCircle } from 'lucide-react';

export const AccountView: React.FC = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  const handleExportData = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(user, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `nexa-profile-${user.uid}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto w-full">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold text-white font-display">Minha Conta NEXA</h2>
        <p className="text-sm text-slate-400">Gerenciamento de perfil, privacidade e conformidade com a LGPD</p>
      </div>

      <GlassCard className="p-6 sm:p-8 flex flex-col gap-6">
        <div className="flex items-center gap-4 pb-6 border-b border-white/[0.08]">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-500 to-sky-400 p-0.5 shadow-lg">
            <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-white">
              <User className="w-8 h-8 text-sky-300" />
            </div>
          </div>

          <div className="flex flex-col">
            <h3 className="text-xl font-bold text-white">{user.displayName}</h3>
            <span className="text-xs text-slate-400 font-mono">{user.email || 'Conta de Demonstração'}</span>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium mt-1">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Autenticado pelo Firebase</span>
            </div>
          </div>
        </div>

        {/* Detalhes de Segurança e LGPD */}
        <div className="flex flex-col gap-3 text-xs text-slate-300 bg-white/[0.04] p-4 rounded-xl border border-white/10">
          <div className="flex items-center gap-2 text-sky-400 font-semibold uppercase tracking-wider text-[11px]">
            <ShieldCheck className="w-4 h-4" />
            <span>Privacidade e Direitos do Titular (LGPD)</span>
          </div>
          <p className="leading-relaxed">
            Seus dados são minimizados exclusivamente para a operação das linhas virtuais do ecossistema. Não compartilhamos informações com terceiros nem com operadoras de telefonia pública.
          </p>
        </div>

        {/* Ações da Conta */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <GlassButton
            variant="glass"
            size="md"
            icon={<Download className="w-4 h-4 text-sky-400" />}
            onClick={handleExportData}
          >
            Exportar Meus Dados (JSON)
          </GlassButton>

          <GlassButton
            variant="danger"
            size="md"
            icon={<LogOut className="w-4 h-4" />}
            onClick={logout}
          >
            Encerrar Sessão
          </GlassButton>
        </div>
      </GlassCard>
    </div>
  );
};
