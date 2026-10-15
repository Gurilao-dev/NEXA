import React, { useState } from 'react';
import { GlassSurface, GlassButton } from '@nexa/ui';
import { Eye, EyeOff, ArrowUpRight, ArrowDownLeft, FileText, Copy, Check } from 'lucide-react';

interface BalanceCardProps {
  balanceCents: number;
  guestUid: string;
  onOpenPixSend: () => void;
  onOpenPixReceive: () => void;
  onOpenStatement: () => void;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({
  balanceCents,
  guestUid,
  onOpenPixSend,
  onOpenPixReceive,
  onOpenStatement,
}) => {
  const [showBalance, setShowBalance] = useState(true);
  const [copied, setCopied] = useState(false);

  const formattedBalance = (balanceCents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  const handleCopyKey = () => {
    navigator.clipboard.writeText(guestUid);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <GlassSurface
      variant="dense"
      blur="hero"
      glow={true}
      className="p-6 sm:p-8 rounded-3xl border border-sky-500/20 bg-gradient-to-br from-slate-900/90 via-sky-950/40 to-slate-950/90 shadow-2xl"
    >
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sky-400">
            <span>Saldo Disponível (Crédito Simulado)</span>
            <button
              onClick={() => setShowBalance(!showBalance)}
              className="text-slate-400 hover:text-white transition-colors"
              aria-label={showBalance ? 'Ocultar saldo' : 'Exibir saldo'}
            >
              {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <div className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mt-1 font-display">
            {showBalance ? formattedBalance : '••••••••'}
          </div>
        </div>

        <button
          onClick={handleCopyKey}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-xs text-slate-300 transition-all active:scale-95"
          title="Copiar Chave Pix Simulada"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-sky-400" />}
          <span className="font-mono text-[11px]">{copied ? 'Copiada!' : 'Minha Chave'}</span>
        </button>
      </div>

      <p className="text-xs text-slate-400 mt-2">
        Crédito individual de demonstração concedido automaticamente para testes.
      </p>

      {/* Ações Rápidas */}
      <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-white/[0.08]">
        <GlassButton
          variant="primary"
          size="md"
          icon={<ArrowUpRight className="w-4 h-4" />}
          onClick={onOpenPixSend}
          className="w-full flex-col sm:flex-row py-3"
        >
          Enviar Pix
        </GlassButton>

        <GlassButton
          variant="secondary"
          size="md"
          icon={<ArrowDownLeft className="w-4 h-4 text-emerald-400" />}
          onClick={onOpenPixReceive}
          className="w-full flex-col sm:flex-row py-3"
        >
          Receber
        </GlassButton>

        <GlassButton
          variant="glass"
          size="md"
          icon={<FileText className="w-4 h-4 text-sky-400" />}
          onClick={onOpenStatement}
          className="w-full flex-col sm:flex-row py-3"
        >
          Extrato
        </GlassButton>
      </div>
    </GlassSurface>
  );
};
