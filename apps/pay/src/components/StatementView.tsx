import React, { useState } from 'react';
import { GlassCard, GlassInput, GlassButton } from '@nexa/ui';
import { WalletLedgerEntry } from '@nexa/types';
import { ArrowUpRight, ArrowDownLeft, Gift, ShoppingCart, Search, Receipt } from 'lucide-react';

interface StatementViewProps {
  entries: WalletLedgerEntry[];
  onSelectReceipt: (operationId: string) => void;
  onRefresh: () => void;
  loading?: boolean;
}

export const StatementView: React.FC<StatementViewProps> = ({
  entries,
  onSelectReceipt,
  onRefresh,
  loading = false,
}) => {
  const [filter, setFilter] = useState<'all' | 'in' | 'out'>('all');
  const [search, setSearch] = useState('');

  const filteredEntries = entries.filter((entry) => {
    if (filter === 'in' && entry.amountCents < 0) return false;
    if (filter === 'out' && entry.amountCents > 0) return false;
    if (search && !entry.description.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const getIcon = (type: string, amountCents: number) => {
    if (type === 'INITIAL_GRANT') {
      return (
        <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center shrink-0">
          <Gift className="w-4 h-4" />
        </div>
      );
    }
    if (type === 'CHECKOUT_PAYMENT') {
      return (
        <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center shrink-0">
          <ShoppingCart className="w-4 h-4" />
        </div>
      );
    }
    if (amountCents > 0) {
      return (
        <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
          <ArrowDownLeft className="w-4 h-4" />
        </div>
      );
    }
    return (
      <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0">
        <ArrowUpRight className="w-4 h-4" />
      </div>
    );
  };

  return (
    <GlassCard
      title="Extrato de Transações"
      subtitle="Histórico imutável de movimentações da sua carteira de demonstração"
      action={
        <GlassButton variant="ghost" size="sm" onClick={onRefresh} loading={loading}>
          Atualizar
        </GlassButton>
      }
      className="p-5 sm:p-6"
    >
      {/* Controles de Filtro e Busca */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex-1">
          <GlassInput
            placeholder="Buscar por descrição..."
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/[0.06] border border-white/10 self-start">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filter === 'all' ? 'bg-sky-500/80 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setFilter('in')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filter === 'in' ? 'bg-emerald-500/80 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Entradas
          </button>
          <button
            onClick={() => setFilter('out')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filter === 'out' ? 'bg-rose-500/80 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Saídas
          </button>
        </div>
      </div>

      {/* Lista de Entradas */}
      {filteredEntries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center gap-2 text-slate-400">
          <Receipt className="w-10 h-10 opacity-30" />
          <p className="text-sm">Nenhuma transação encontrada para este filtro.</p>
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-white/[0.06]">
          {filteredEntries.map((entry) => {
            const isPositive = entry.amountCents > 0;
            const formattedAmount = (Math.abs(entry.amountCents) / 100).toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            });
            const formattedDate = new Date(entry.createdAt).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={entry.entryId}
                onClick={() => onSelectReceipt(entry.operationId)}
                className="py-3.5 px-2 flex items-center justify-between gap-4 hover:bg-white/[0.04] rounded-xl cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {getIcon(entry.type, entry.amountCents)}

                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-medium text-white truncate">
                      {entry.description}
                    </span>
                    <span className="text-xs text-slate-400">{formattedDate}</span>
                  </div>
                </div>

                <div className="flex flex-col items-end shrink-0">
                  <span
                    className={`text-sm font-semibold font-mono ${
                      isPositive ? 'text-emerald-400' : 'text-slate-200'
                    }`}
                  >
                    {isPositive ? `+ ${formattedAmount}` : `- ${formattedAmount}`}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Saldo: {(entry.balanceAfterCents / 100).toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </GlassCard>
  );
};
