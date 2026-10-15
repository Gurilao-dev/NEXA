import React, { useState } from 'react';
import { GlassSurface, GlassButton, GlassInput } from '@nexa/ui';
import { MessageSquarePlus, Search, UserCheck, AlertCircle, X, Smartphone } from 'lucide-react';

interface NewConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartDirect: (targetNumberFormatted: string) => Promise<any>;
  contacts: any[];
}

export const NewConversationModal: React.FC<NewConversationModalProps> = ({
  isOpen,
  onClose,
  onStartDirect,
  contacts,
}) => {
  const [targetNumber, setTargetNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetNumber.trim()) return;

    setSubmitting(true);
    setError(null);
    try {
      await onStartDirect(targetNumber.trim());
      onClose();
    } catch (err: any) {
      setError(err.message || 'Contato não encontrado ou número inválido.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelectContact = async (nexaNumber: string) => {
    setSubmitting(true);
    setError(null);
    try {
      await onStartDirect(nexaNumber);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Não foi possível iniciar conversa com este contato.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <GlassSurface
        variant="card"
        className="max-w-md w-full p-6 rounded-3xl border border-emerald-500/30 shadow-2xl shadow-emerald-950/50"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <MessageSquarePlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-display text-white">Nova Conversa</h3>
              <p className="text-xs text-slate-400">Inicie uma conversa direta 1:1</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mb-5">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Número NEXA do Destinatário
          </label>
          <div className="flex gap-2">
            <GlassInput
              value={targetNumber}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTargetNumber(e.target.value)}
              placeholder="+55 (11) 9XXXX-XXXX"
              className="flex-1 font-mono text-sm"
              required
            />
            <GlassButton
              type="submit"
              variant="primary"
              disabled={submitting}
              className="px-4 bg-emerald-600 hover:bg-emerald-500 text-white shrink-0"
            >
              <Search className="w-4 h-4" />
            </GlassButton>
          </div>
          <p className="text-[11px] text-slate-400 mt-1.5">
            Informe o número no padrão brasileiro fictício do ecossistema.
          </p>
        </form>

        {contacts.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Contatos Salvos</span>
            </h4>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {contacts.map((contact) => (
                <button
                  key={contact.contactId}
                  type="button"
                  onClick={() => handleSelectContact(contact.nexaNumber)}
                  className="w-full p-2.5 rounded-xl bg-white/5 border border-white/5 hover:bg-emerald-500/10 hover:border-emerald-500/30 text-left transition-colors flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 group-hover:text-emerald-300 text-xs font-bold">
                      {contact.nickname ? contact.nickname.substring(0, 2).toUpperCase() : 'NX'}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">{contact.nickname}</div>
                      <div className="font-mono text-xs text-slate-400">{contact.nexaNumber}</div>
                    </div>
                  </div>
                  <Smartphone className="w-4 h-4 text-slate-500 group-hover:text-emerald-400" />
                </button>
              ))}
            </div>
          </div>
        )}
      </GlassSurface>
    </div>
  );
};
