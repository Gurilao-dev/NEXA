import React, { useState } from 'react';
import { GlassModal, GlassButton } from '@nexa/ui';
import { PaymentReceipt } from '@nexa/types';
import { CheckCircle2, Copy, Check, ShieldAlert } from 'lucide-react';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  receipt: PaymentReceipt | null;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ isOpen, onClose, receipt }) => {
  const [copied, setCopied] = useState(false);

  if (!receipt) return null;

  const formattedAmount = (receipt.amountCents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  const formattedDate = new Date(receipt.timestamp).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const handleCopyProtocol = () => {
    navigator.clipboard.writeText(receipt.operationId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <GlassModal
      isOpen={isOpen}
      onClose={onClose}
      title="Comprovante de Operação"
      subtitle="Registro eletrônico interno do NEXA Ecosystem"
      maxWidth="md"
    >
      <div className="flex flex-col gap-5 relative overflow-hidden">
        {/* Marca d'água de Simulação */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5 rotate-[-25deg] select-none">
          <span className="text-4xl font-black text-white text-center leading-tight">
            SIMULADO<br />SEM VALOR FISCAL
          </span>
        </div>

        {/* Cabeçalho do Recibo */}
        <div className="flex flex-col items-center text-center gap-2 pb-4 border-b border-white/[0.08]">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <span className="text-xs uppercase tracking-widest text-emerald-400 font-bold">
            Transação Liquidada com Sucesso
          </span>
          <span className="text-3xl font-extrabold text-white font-display">{formattedAmount}</span>
          <span className="text-xs text-slate-400">{receipt.description}</span>
        </div>

        {/* Detalhes dos Campos */}
        <div className="flex flex-col gap-3 text-xs">
          <div className="flex justify-between py-1 border-b border-white/[0.04]">
            <span className="text-slate-400">Data e Hora</span>
            <span className="text-slate-200 font-mono">{formattedDate}</span>
          </div>

          <div className="flex justify-between py-1 border-b border-white/[0.04]">
            <span className="text-slate-400">Origem (Pagador)</span>
            <span className="text-slate-200 font-mono truncate max-w-[200px]">{receipt.payerUid}</span>
          </div>

          <div className="flex justify-between py-1 border-b border-white/[0.04]">
            <span className="text-slate-400">Destino (Recebedor)</span>
            <span className="text-slate-200 font-mono truncate max-w-[200px]">{receipt.payeeUid}</span>
          </div>

          {receipt.orderId && (
            <div className="flex justify-between py-1 border-b border-white/[0.04]">
              <span className="text-slate-400">ID do Pedido NEXA Mobile</span>
              <span className="text-sky-300 font-mono">{receipt.orderId}</span>
            </div>
          )}

          <div className="flex items-center justify-between py-1">
            <span className="text-slate-400">Protocolo de Operação</span>
            <div className="flex items-center gap-1.5 font-mono text-sky-400">
              <span className="truncate max-w-[160px]">{receipt.operationId}</span>
              <button
                onClick={handleCopyProtocol}
                className="text-slate-400 hover:text-white p-1 rounded transition-colors"
                title="Copiar Protocolo"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Tarja de Aviso Legal Obrigatório */}
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-2.5 text-[11px] text-amber-300">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{receipt.watermark}</span>
        </div>

        <div className="flex justify-end pt-2">
          <GlassButton variant="primary" size="md" onClick={onClose} className="w-full sm:w-auto">
            Fechar Comprovante
          </GlassButton>
        </div>
      </div>
    </GlassModal>
  );
};
