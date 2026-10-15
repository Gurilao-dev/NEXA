import React, { useState, useEffect } from 'react';
import { mobileApi } from '../services/api.js';
import { TelecomOrder } from '@nexa/types';
import { GlassCard, GlassButton } from '@nexa/ui';
import { CheckCircle2, Clock, Smartphone, MessageSquare } from 'lucide-react';

interface OrdersViewProps {
  orderIdParam?: string | null;
  onViewMyNumbers: () => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({ orderIdParam, onViewMyNumbers }) => {
  const [order, setOrder] = useState<TelecomOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const chatUrl = import.meta.env.VITE_CHAT_URL || 'http://localhost:5175';

  useEffect(() => {
    if (!orderIdParam) return;
    setLoading(true);
    mobileApi
      .getOrder(orderIdParam)
      .then((data) => {
        setOrder(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Falha ao consultar pedido.');
        setLoading(false);
      });
  }, [orderIdParam]);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />
        <span className="text-sm text-slate-400">Verificando status da compra junto ao servidor...</span>
      </div>
    );
  }

  if (order) {
    const isPaid = order.status === 'PAID';

    return (
      <GlassCard className="p-8 max-w-xl mx-auto flex flex-col items-center text-center gap-5 border border-emerald-500/30">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
            Confirmação de Ativação
          </span>
          <h2 className="text-2xl font-bold text-white font-display">
            {isPaid ? 'Linha Provisionada com Sucesso!' : `Pedido: ${order.status}`}
          </h2>
          <p className="text-sm text-slate-300 max-w-md mt-1">
            Seu pedido foi autenticado e o número virtual foi vinculado permanentemente à sua conta Google.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white/[0.04] border border-white/10 w-full text-xs font-mono flex flex-col gap-1.5 text-left">
          <div className="flex justify-between">
            <span className="text-slate-400">ID do Pedido:</span>
            <span className="text-slate-200">{order.orderId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Status no Servidor:</span>
            <span className="text-emerald-400 font-bold">{order.status}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Valor Simulado:</span>
            <span className="text-slate-200">
              {(order.expectedAmountCents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center pt-2">
          <GlassButton variant="secondary" size="md" onClick={onViewMyNumbers} icon={<Smartphone className="w-4 h-4" />}>
            Ver em Meus Números
          </GlassButton>

          <a
            href={chatUrl}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-semibold shadow-lg hover:from-purple-500 hover:to-indigo-500 transition-all active:scale-95"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Ir para o NEXA Chat</span>
          </a>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-8 max-w-md mx-auto text-center flex flex-col items-center gap-3">
      <Clock className="w-10 h-10 text-slate-500" />
      <h3 className="text-lg font-bold text-white">Nenhum pedido em andamento</h3>
      <p className="text-sm text-slate-400">
        Navegue pelo catálogo para reservar e ativar sua primeira linha virtual.
      </p>
    </GlassCard>
  );
};
