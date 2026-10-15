import React, { useState } from 'react';
import { GlassCard, GlassButton } from '@nexa/ui';
import { Smartphone, CreditCard, ArrowRight, CheckCircle2, RotateCcw } from 'lucide-react';

export const InteractiveDemo: React.FC = () => {
  const [balance, setBalance] = useState(300.0);
  const [purchased, setPurchased] = useState(false);
  const itemPrice = 29.9;

  const handleSimulate = () => {
    if (balance >= itemPrice) {
      setBalance((prev) => Math.round((prev - itemPrice) * 100) / 100);
      setPurchased(true);
    }
  };

  const handleReset = () => {
    setBalance(300.0);
    setPurchased(false);
  };

  return (
    <section className="py-20 px-4 max-w-5xl mx-auto">
      <div className="flex flex-col items-center text-center gap-3 mb-14">
        <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">
          Simulador Interativo
        </span>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-display">
          Experimente o Checkout Lado a Lado
        </h2>
        <p className="text-sm text-slate-300 max-w-lg leading-relaxed">
          Veja como o fluxo entre a operadora e o banco ocorre sem compartilhamento de cookies e mediado exclusivamente por tickets seguros no servidor.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {/* Painel da Operadora (NEXA Mobile) */}
        <GlassCard className="p-6 sm:p-8 flex flex-col justify-between gap-6 border-indigo-500/30">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">NEXA Mobile • Vitrine</span>
            <Smartphone className="w-5 h-5 text-indigo-400" />
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs text-slate-400 uppercase font-semibold">Linha Selecionada</span>
            <span className="text-2xl font-bold font-mono text-white">+55 (11) 98888-0001</span>
            <span className="text-xs text-slate-300">Preço: R$ 29,90 (Créditos Fictícios)</span>
          </div>

          {purchased ? (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Linha ativa e vinculada à sua conta!</span>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-slate-400">
              Clique no botão ao lado para autorizar o débito na sua carteira NEXA Pay.
            </div>
          )}

          <div className="flex justify-end pt-2">
            <GlassButton
              variant="secondary"
              size="sm"
              icon={<RotateCcw className="w-3.5 h-3.5" />}
              onClick={handleReset}
            >
              Reiniciar Simulação
            </GlassButton>
          </div>
        </GlassCard>

        {/* Painel do Banco (NEXA Pay) */}
        <GlassCard className="p-6 sm:p-8 flex flex-col justify-between gap-6 border-sky-500/30 bg-gradient-to-br from-slate-900 via-sky-950/40 to-slate-950">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-400">NEXA Pay • Carteira Demo</span>
            <CreditCard className="w-5 h-5 text-sky-400" />
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs text-slate-400 uppercase font-semibold">Saldo Atual da Carteira</span>
            <span className="text-3xl font-extrabold text-white font-mono font-display">
              R$ {balance.toFixed(2).replace('.', ',')}
            </span>
            <span className="text-[11px] text-slate-400">Sem valor monetário real</span>
          </div>

          <GlassButton
            variant="primary"
            size="lg"
            disabled={purchased || balance < itemPrice}
            onClick={handleSimulate}
            icon={<ArrowRight className="w-4 h-4" />}
            className="w-full justify-center"
          >
            {purchased ? 'Pagamento Liquidado' : 'Confirmar Débito Simulado'}
          </GlassButton>
        </GlassCard>
      </div>
    </section>
  );
};
