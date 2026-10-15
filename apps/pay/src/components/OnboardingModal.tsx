import React from 'react';
import { GlassModal, GlassButton } from '@nexa/ui';
import { ShieldCheck, Coins, Smartphone, RefreshCw, AlertTriangle } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  return (
    <GlassModal
      isOpen={isOpen}
      onClose={onClose}
      title="Bem-vindo ao NEXA Pay"
      subtitle="Guia rápido do nosso ambiente de demonstração financeira"
      maxWidth="md"
    >
      <div className="flex flex-col gap-4 text-xs text-slate-300">
        <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-sky-500/10 border border-sky-500/20">
          <Coins className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1">
            <span className="font-semibold text-white text-sm">Crédito Inicial de R$ 300,00</span>
            <p className="leading-relaxed">
              Ao acessar pela primeira vez, você recebe automaticamente R$ 300,00 em créditos virtuais para testar transferências e compras no ecossistema.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
          <Smartphone className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1">
            <span className="font-semibold text-white text-sm">Integração com NEXA Mobile</span>
            <p className="leading-relaxed">
              Você pode utilizar seus créditos para liquidar pedidos de números virtuais na operadora de demonstração de forma 100% segura e atômica.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1">
            <span className="font-semibold text-amber-300 text-sm">Sessão Temporária de Visitante</span>
            <p className="leading-relaxed">
              Sua carteira é anônima e vinculada ao armazenamento deste navegador. Ao limpar os dados de navegação, a carteira atual será descartada.
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <GlassButton variant="primary" size="md" onClick={onClose} className="w-full sm:w-auto">
            Entendido, começar a usar
          </GlassButton>
        </div>
      </div>
    </GlassModal>
  );
};
