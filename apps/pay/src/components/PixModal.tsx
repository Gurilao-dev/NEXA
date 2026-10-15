import React, { useState } from 'react';
import { GlassModal, GlassInput, GlassButton } from '@nexa/ui';
import { payApi } from '../services/api.js';
import { PaymentReceipt } from '@nexa/types';
import { QrCode, Send, Copy, Check, AlertCircle } from 'lucide-react';

interface PixModalProps {
  isOpen: boolean;
  onClose: () => void;
  guestUid: string;
  defaultTab?: 'send' | 'receive';
  onTransferSuccess: (receipt: PaymentReceipt) => void;
}

export const PixModal: React.FC<PixModalProps> = ({
  isOpen,
  onClose,
  guestUid,
  defaultTab = 'send',
  onTransferSuccess,
}) => {
  const [tab, setTab] = useState<'send' | 'receive'>(defaultTab);
  const [recipientKey, setRecipientKey] = useState('');
  const [amountStr, setAmountStr] = useState('10,00');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const numericAmount = parseFloat(amountStr.replace(/\./g, '').replace(',', '.'));
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError('Informe um valor válido maior que zero.');
      return;
    }

    const amountCents = Math.round(numericAmount * 100);

    setLoading(true);
    try {
      const receipt = await payApi.transferPix(
        recipientKey.trim(),
        amountCents,
        description.trim() || 'Pix simulado NEXA'
      );
      onTransferSuccess(receipt);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Falha ao processar transferência simulada.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(guestUid);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <GlassModal
      isOpen={isOpen}
      onClose={onClose}
      title="Pix Simulado NEXA"
      subtitle="Transferências de créditos fictícios entre carteiras do ecossistema"
      maxWidth="md"
    >
      <div className="flex flex-col gap-5">
        {/* Seletor de Abas */}
        <div className="grid grid-cols-2 p-1 rounded-xl bg-white/[0.06] border border-white/10 text-sm">
          <button
            onClick={() => setTab('send')}
            className={`py-2 rounded-lg font-medium transition-all ${
              tab === 'send'
                ? 'bg-sky-500/80 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Enviar Créditos
          </button>
          <button
            onClick={() => setTab('receive')}
            className={`py-2 rounded-lg font-medium transition-all ${
              tab === 'receive'
                ? 'bg-sky-500/80 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Receber Créditos
          </button>
        </div>

        {/* 1. Aba Enviar */}
        {tab === 'send' && (
          <form onSubmit={handleSend} className="flex flex-col gap-4">
            <GlassInput
              label="Chave Interna NEXA do Destinatário"
              placeholder="ex: gst_abc123456..."
              value={recipientKey}
              onChange={(e) => setRecipientKey(e.target.value)}
              required
            />

            <GlassInput
              label="Valor Simulado (R$)"
              placeholder="0,00"
              value={amountStr}
              onChange={(e) => setAmountStr(e.target.value)}
              required
            />

            <GlassInput
              label="Descrição (Opcional)"
              placeholder="ex: Divisão do café fictício"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <GlassButton variant="ghost" size="md" onClick={onClose} type="button">
                Cancelar
              </GlassButton>
              <GlassButton
                variant="primary"
                size="md"
                type="submit"
                loading={loading}
                icon={<Send className="w-4 h-4" />}
              >
                Confirmar Pix Simulado
              </GlassButton>
            </div>
          </form>
        )}

        {/* 2. Aba Receber */}
        {tab === 'receive' && (
          <div className="flex flex-col items-center text-center gap-4 py-2">
            <div className="p-4 rounded-2xl bg-white text-slate-950 shadow-2xl flex flex-col items-center justify-center">
              {/* QR Code Simulado Original SVG */}
              <div className="w-48 h-48 bg-slate-100 rounded-xl flex flex-col items-center justify-center p-2 border-2 border-slate-300 relative">
                <QrCode className="w-36 h-36 text-slate-900" />
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mt-1">
                  NEXA PAY • SIMULAÇÃO
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1 max-w-xs">
              <span className="text-xs font-semibold text-slate-400">Sua Chave Simulado</span>
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.08] border border-white/10">
                <span className="font-mono text-xs text-sky-300 truncate">{guestUid}</span>
                <button
                  onClick={handleCopy}
                  className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
                  title="Copiar"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 max-w-xs leading-relaxed">
              Compartilhe esta chave com outro visitante para que ele possa transferir créditos simulados para a sua carteira demo.
            </p>
          </div>
        )}
      </div>
    </GlassModal>
  );
};
