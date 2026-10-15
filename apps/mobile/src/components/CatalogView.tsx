import React, { useState, useEffect } from 'react';
import { mobileApi } from '../services/api.js';
import { VirtualNumber } from '@nexa/types';
import { GlassSurface, GlassButton, GlassCard } from '@nexa/ui';
import { Smartphone, Sparkles, Filter, CheckCircle2, ShoppingBag } from 'lucide-react';

interface CatalogViewProps {
  onSelectNumber: (number: VirtualNumber) => void;
}

export const CatalogView: React.FC<CatalogViewProps> = ({ onSelectNumber }) => {
  const [numbers, setNumbers] = useState<VirtualNumber[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDdd, setSelectedDdd] = useState<string>('');
  const [selectedPattern, setSelectedPattern] = useState<string>('');

  const dddList = ['', '11', '21', '31', '41', '51', '61', '71', '81', '85', '91'];
  const patternList = [
    { id: '', label: 'Todos os Padrões' },
    { id: 'standard', label: 'Padrão' },
    { id: 'golden', label: 'Golden' },
    { id: 'platinum', label: 'Platinum' },
    { id: 'consecutive', label: 'Sequencial' },
  ];

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    mobileApi
      .getNumbers({ ddd: selectedDdd || undefined, pattern: selectedPattern || undefined })
      .then((data) => {
        if (mounted) {
          setNumbers(data.items);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error(err);
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [selectedDdd, selectedPattern]);

  const getPatternBadge = (pattern: string) => {
    switch (pattern) {
      case 'platinum':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r from-purple-500/20 to-sky-500/20 border border-purple-400/40 text-purple-300 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-purple-400" /> Platinum
          </span>
        );
      case 'golden':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 border border-amber-400/30 text-amber-300">
            Golden
          </span>
        );
      case 'consecutive':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sky-500/15 border border-sky-400/30 text-sky-300">
            Sequencial
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider bg-slate-500/15 border border-slate-400/20 text-slate-300">
            Padrão
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Banner de Apresentação da Vitrine */}
      <GlassSurface
        variant="dense"
        blur="hero"
        glow={true}
        className="p-6 sm:p-8 rounded-3xl border border-indigo-500/20 bg-gradient-to-r from-indigo-950/40 via-slate-900/60 to-purple-950/40"
      >
        <div className="flex flex-col gap-2 max-w-xl">
          <span className="text-xs font-bold uppercase tracking-widest text-sky-400">
            Catálogo de Linhas Virtuais
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight font-display">
            Escolha seu Número NEXA Exclusivo
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Identificadores virtuais únicos para você conversar em alta definição no NEXA Chat. Pague com seus créditos de demonstração da NEXA Pay.
          </p>
        </div>
      </GlassSurface>

      {/* Controles de Filtros */}
      <div className="flex flex-col gap-3 p-4 rounded-2xl bg-white/[0.04] border border-white/10">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          <Filter className="w-3.5 h-3.5" />
          <span>Filtros do Catálogo</span>
        </div>

        {/* Filtro por DDD */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs text-slate-400 mr-1 shrink-0">DDD:</span>
          {dddList.map((ddd) => (
            <button
              key={ddd}
              onClick={() => setSelectedDdd(ddd)}
              className={`px-3 py-1 rounded-xl text-xs font-medium shrink-0 transition-all ${
                selectedDdd === ddd
                  ? 'bg-sky-500 text-white shadow-md'
                  : 'bg-white/[0.06] text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              {ddd ? `(${ddd})` : 'Todos'}
            </button>
          ))}
        </div>

        {/* Filtro por Padrão */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <span className="text-xs text-slate-400 mr-1 shrink-0">Padrão:</span>
          {patternList.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedPattern(p.id)}
              className={`px-3 py-1 rounded-xl text-xs font-medium shrink-0 transition-all ${
                selectedPattern === p.id
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white/[0.06] text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Números */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />
          <span className="text-sm text-slate-400">Consultando estoque de linhas virtuais...</span>
        </div>
      ) : numbers.length === 0 ? (
        <div className="py-16 flex flex-col items-center justify-center text-center gap-2 text-slate-400">
          <Smartphone className="w-10 h-10 opacity-30" />
          <p className="text-sm">Nenhum número virtual disponível para estes filtros no momento.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {numbers.map((item) => {
            const formattedPrice = (item.priceCents / 100).toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            });

            return (
              <GlassCard
                key={item.numberId}
                interactive={true}
                className="p-5 flex flex-col justify-between gap-4 border border-white/10 hover:border-indigo-400/40 transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  {getPatternBadge(item.pattern)}
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-xl font-bold font-mono text-white tracking-tight group-hover:text-sky-300 transition-colors">
                    {item.formatted}
                  </span>
                  <span className="text-xs text-slate-400">Linha digital para NEXA Chat</span>
                </div>

                <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                      Preço Simulado
                    </span>
                    <span className="text-base font-bold text-white font-display">
                      {formattedPrice}
                    </span>
                  </div>

                  <GlassButton
                    variant="primary"
                    size="sm"
                    icon={<ShoppingBag className="w-3.5 h-3.5" />}
                    onClick={() => onSelectNumber(item)}
                  >
                    Comprar
                  </GlassButton>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
};
