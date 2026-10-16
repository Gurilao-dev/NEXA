import React, { useState } from 'react';
import { GlassModal, GlassButton } from '@nexa/ui';
import { VirtualNumber } from '@nexa/types';
import { useAuth } from '../context/AuthContext.js';
import { mobileApi } from '../services/api.js';
import { Smartphone, ShieldCheck, AlertTriangle, ArrowRight, LogIn } from 'lucide-react';

interface NumberDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  number: VirtualNumber | null;
}

export const NumberDetailModal: React.FC<NumberDetailModalProps> = ({
  isOpen,
  onClose,
  number,
}) => {
  const { user, loginWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const payBaseUrl = import.meta.env.VITE_PAY_URL || 'http://localhost:5173';

  if (!number) return null;

  const formattedPrice = (number.priceCents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setError(err?.message || 'Falha ao autenticar com o Google.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async () => {
    if (!user) {
      await handleGoogleLogin();
      return;
    }

    setLoading(true);
    setError('');
    try {
      // 1. Cria pedido e reserva o número
      const order = await mobileApi.createOrder(number.numberId);

      // 2. Redireciona para o NEXA Pay com o ticket opaco
      window.location.href = `${payBaseUrl}?ticket=${order.checkoutTicket}`;
    } catch (err: any) {
      setError(err.message || 'Falha ao reservar número para checkout.');
      setLoading(false);
    }
  };

  return (
    <GlassModal
      isOpen={isOpen}
      onClose={onClose}
      title="Reserva de Número Virtual"
      subtitle="Detalhes da linha exclusiva para o NEXA Chat"
      maxWidth="md"
    >
      <div className="flex flex-col gap-5">
        {/* Cartão de Destaque do Número */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-950/50 to-slate-900/60 border border-indigo-500/30 flex flex-col items-center text-center gap-2">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mb-1">
            <Smartphone className="w-6 h-6" />
          </div>

          <span className="text-2xl sm:text-3xl font-extrabold font-mono text-white tracking-tight">
            {number.formatted}
          </span>
          <span className="text-xs text-indigo-300 font-medium uppercase tracking-widest">
            DDD {number.ddd} • Padrão {number.pattern}
          </span>
          <span className="text-3xl font-black text-white font-display mt-2">{formattedPrice}</span>
          <span className="text-[11px] text-slate-400">Em créditos de demonstração da NEXA Pay</span>
        </div>

        {/* Regras e Transparência Obrigatórias */}
        <div className="flex flex-col gap-2.5 text-xs text-slate-300 bg-white/[0.04] p-4 rounded-xl border border-white/10">
          <div className="flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>Identidade única e persistente vinculada à sua conta Google após o pagamento.</span>
          </div>
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>Este número não funciona em telefonia tradicional e não recebe SMS de bancos reais.</span>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
            {error}
          </div>
        )}

        {/* Ações */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <GlassButton variant="ghost" size="md" onClick={onClose} disabled={loading}>
            Voltar
          </GlassButton>

          {user ? (
            <GlassButton
              variant="primary"
              size="lg"
              loading={loading}
              onClick={handleCheckout}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Pagar com NEXA Pay
            </GlassButton>
          ) : (
            <GlassButton
              variant="primary"
              size="lg"
              loading={loading}
              onClick={handleGoogleLogin}
              icon={<LogIn className="w-4 h-4" />}
            >
              Entrar com Google para Comprar
            </GlassButton>
          )}
        </div>
      </div>
    </GlassModal>
  );
};
