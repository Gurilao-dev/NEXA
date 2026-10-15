import React, { useState, useEffect } from 'react';
import { GlassCard, GlassButton } from '@nexa/ui';
import { payApi } from '../services/api.js';
import { CheckoutPreview, PaymentReceipt } from '@nexa/types';
import { Smartphone, CheckCircle, ArrowLeft, AlertCircle, Clock } from 'lucide-react';

interface CheckoutViewProps {
  ticket: string;
  balanceCents: number;
  onPaymentComplete: (receipt: PaymentReceipt) => void;
  onCancel: () => void;
}

export const CheckoutView: React.FC<CheckoutViewProps> = ({
  ticket,
  balanceCents,
  onPaymentComplete,
  onCancel,
}) => {
  const [preview, setPreview] = useState<CheckoutPreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');
  const [receipt, setReceipt] = useState<PaymentReceipt | null>(null);

  const mobileBaseUrl = import.meta.env.VITE_MOBILE_URL || 'http://localhost:5174';

  useEffect(() => {
    let mounted = true;
    payApi
      .getCheckoutPreview(ticket)
      .then((data) => {
        if (mounted) {
          setPreview(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(err.message || 'Falha ao carregar checkout.');
          setLoading(false);
        }
      });
    return () => {
      mounted = false;
    };
  }, [ticket]);

  const handleConfirmPayment = async () => {
    setPaying(true);
    setError('');
    try {
      const res = await payApi.confirmCheckout(ticket);
      setReceipt(res);
      onPaymentComplete(res);
    } catch (err: any) {
      setError(err.message || 'Falha ao liquidar pagamento.');
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <GlassCard className="p-8 flex items-center justify-center text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-sky-400 border-t-transparent animate-spin" />
          <span className="text-sm text-slate-300">Carregando dados da compra da operadora...</span>
        </div>
      </GlassCard>
    );
  }

  if (error && !receipt) {
    return (
      <GlassCard className="p-8 flex flex-col items-center text-center gap-4">
        <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-white">Não foi possível prosseguir com o pagamento</h3>
        <p className="text-sm text-slate-400 max-w-sm">{error}</p>
        <GlassButton variant="secondary" size="md" onClick={onCancel}>
          Voltar para a Carteira
        </GlassButton>
      </GlassCard>
    );
  }

  // Sucesso de Pagamento
  if (receipt && preview) {
    return (
      <GlassCard className="p-8 flex flex-col items-center text-center gap-5 border border-emerald-500/30">
        <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
          <CheckCircle className="w-8 h-8" />
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
            Pagamento Simulado Concluído
          </span>
          <h2 className="text-2xl font-bold text-white">Linha NEXA Liberada!</h2>
          <p className="text-sm text-slate-300 max-w-md mt-1">
            O valor de R$ {(receipt.amountCents / 100).toFixed(2)} em créditos de demonstração foi debitado e o número{' '}
            <strong className="text-sky-400 font-mono">{preview.virtualNumberFormatted}</strong> foi vinculado à sua conta da operadora.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white/[0.04] border border-white/10 w-full max-w-sm text-left flex flex-col gap-1.5 text-xs font-mono">
          <div className="flex justify-between">
            <span className="text-slate-400">Protocolo:</span>
            <span className="text-slate-200 truncate">{receipt.operationId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Pedido Mobile:</span>
            <span className="text-sky-300">{preview.orderId}</span>
          </div>
        </div>

        <a
          href={`${mobileBaseUrl}/pedidos?orderId=${preview.orderId}`}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-medium shadow-lg hover:from-sky-400 hover:to-indigo-500 transition-all active:scale-95 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para NEXA Mobile
        </a>
      </GlassCard>
    );
  }

  if (!preview) return null;

  const hasSufficientBalance = balanceCents >= preview.amountCents;
  const formattedAmount = (preview.amountCents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  return (
    <GlassCard
      title="Pagamento de Linha Virtual"
      subtitle="Pedido originado pela NEXA Mobile"
      className="p-6 sm:p-8 max-w-xl mx-auto"
    >
      <div className="flex flex-col gap-6">
        {/* Cartão de Resumo do Item */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-sky-950/40 to-slate-900/60 border border-sky-500/20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Smartphone className="w-6 h-6" />
            </div>

            <div className="flex flex-col">
              <span className="text-xs text-sky-400 font-semibold uppercase tracking-wider">
                Número Virtual Reservado
              </span>
              <span className="text-lg font-bold text-white font-mono">
                {preview.virtualNumberFormatted}
              </span>
              <span className="text-xs text-slate-400">{preview.itemDescription}</span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400 block">Total a Pagar</span>
            <span className="text-2xl font-extrabold text-white font-display">
              {formattedAmount}
            </span>
          </div>
        </div>

        {/* Informações da Carteira e Validação de Saldo */}
        <div className="flex flex-col gap-2.5 p-4 rounded-xl bg-white/[0.04] border border-white/10 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-400">Saldo Atual da Carteira Demo:</span>
            <span className="font-semibold text-white font-mono">
              {(balanceCents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-400">Saldo Após o Débito:</span>
            <span
              className={`font-semibold font-mono ${
                hasSufficientBalance ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {hasSufficientBalance
                ? ((balanceCents - preview.amountCents) / 100).toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })
                : 'Saldo Insuficiente'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-amber-300 pt-1 text-[11px]">
            <Clock className="w-3.5 h-3.5 shrink-0" />
            <span>Reserva garantida por 15 minutos.</span>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          <GlassButton variant="ghost" size="md" onClick={onCancel} disabled={paying}>
            Cancelar
          </GlassButton>

          <GlassButton
            variant="primary"
            size="lg"
            loading={paying}
            disabled={!hasSufficientBalance}
            onClick={handleConfirmPayment}
          >
            {hasSufficientBalance ? 'Confirmar Pagamento Simulado' : 'Saldo Insuficiente'}
          </GlassButton>
        </div>
      </div>
    </GlassCard>
  );
};
