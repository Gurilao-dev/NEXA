import React from 'react';
import { BrandLogo } from '@nexa/ui';
import { Shield } from 'lucide-react';

export const Footer: React.FC = () => {
  const payUrl = import.meta.env.VITE_PAY_URL || 'http://localhost:5173';
  const chatUrl = import.meta.env.VITE_CHAT_URL || 'http://localhost:5175';

  return (
    <footer className="w-full border-t border-white/[0.08] bg-slate-950/80 py-12 px-4 sm:px-6 mt-20">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        <div className="flex flex-col gap-2 max-w-sm">
          <BrandLogo variant="mobile" size="md" />
          <p className="text-xs text-slate-400 leading-relaxed mt-1">
            Operadora virtual simulada e central de linhas exclusivas para mensageria de alta fidelidade no NEXA Ecosystem.
          </p>
        </div>

        {/* Links do Ecossistema */}
        <div className="flex flex-wrap gap-8 text-xs text-slate-300">
          <div className="flex flex-col gap-2">
            <span className="font-semibold text-white uppercase tracking-wider text-[11px]">Ecossistema</span>
            <a href={payUrl} className="hover:text-sky-400 transition-colors">NEXA Pay (Banco Simulado)</a>
            <a href="/" className="hover:text-sky-400 transition-colors">NEXA Mobile (Operadora)</a>
            <a href={chatUrl} className="hover:text-sky-400 transition-colors">NEXA Chat (Mensageiro)</a>
          </div>

          <div className="flex flex-col gap-2">
            <span className="font-semibold text-white uppercase tracking-wider text-[11px]">Tecnologias</span>
            <span>React 19 + TypeScript</span>
            <span>Fastify + Socket.IO</span>
            <span>Firebase & Cloud Firestore</span>
            <span>WebRTC P2P</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto pt-8 mt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
        <div className="flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-slate-400" />
          <span>Ambiente de Demonstração Tecnológica • Nenhum saldo ou linha possui valor comercial real</span>
        </div>
        <span>© 2026 NEXA Ecosystem. Todos os direitos reservados.</span>
      </div>
    </footer>
  );
};
