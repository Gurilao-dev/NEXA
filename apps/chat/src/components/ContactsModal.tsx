import React, { useState } from 'react';
import { GlassSurface, GlassButton, GlassInput } from '@nexa/ui';
import { Contact, UserPlus, Smartphone, MessageSquare, AlertCircle, X } from 'lucide-react';

interface ContactsModalProps {
  isOpen: boolean;
  onClose: () => void;
  contacts: any[];
  onAddContact: (nexaNumber: string, nickname?: string) => Promise<void>;
  onStartChat: (nexaNumber: string) => void;
}

export const ContactsModal: React.FC<ContactsModalProps> = ({
  isOpen,
  onClose,
  contacts,
  onAddContact,
  onStartChat,
}) => {
  const [nexaNumber, setNexaNumber] = useState('');
  const [nickname, setNickname] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nexaNumber.trim()) return;

    setSubmitting(true);
    setError(null);
    try {
      await onAddContact(nexaNumber.trim(), nickname.trim() || undefined);
      setNexaNumber('');
      setNickname('');
    } catch (err: any) {
      setError(err.message || 'Falha ao salvar contato');
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
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <Contact className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-display text-white">Livro de Contatos</h3>
              <p className="text-xs text-slate-400">Gerencie suas linhas NEXA conectadas</p>
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

        <form onSubmit={handleSubmit} className="p-3.5 rounded-2xl bg-white/5 border border-white/10 mb-4 space-y-3">
          <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <UserPlus className="w-3.5 h-3.5 text-teal-400" />
            <span>Adicionar Novo Contato</span>
          </div>
          <div className="space-y-2">
            <GlassInput
              value={nexaNumber}
              onChange={(e) => setNexaNumber(e.target.value)}
              placeholder="Número (+55 11 9XXXX-XXXX)"
              className="w-full text-xs font-mono"
              required
            />
            <GlassInput
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Apelido / Nome (opcional)"
              className="w-full text-xs"
            />
          </div>
          <GlassButton
            type="submit"
            variant="primary"
            disabled={submitting}
            className="w-full py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-medium"
          >
            {submitting ? 'Salvando...' : 'Salvar Contato'}
          </GlassButton>
        </form>

        <div>
          <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Contatos ({contacts.length})
          </div>
          {contacts.length === 0 ? (
            <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-center text-xs text-slate-400">
              Nenhum contato salvo ainda.
            </div>
          ) : (
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {contacts.map((contact) => (
                <div
                  key={contact.contactId}
                  className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-teal-300 text-xs font-bold">
                      {contact.nickname ? contact.nickname.substring(0, 2).toUpperCase() : 'NX'}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">{contact.nickname}</div>
                      <div className="font-mono text-xs text-slate-400">{contact.nexaNumber}</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onStartChat(contact.nexaNumber);
                      onClose();
                    }}
                    className="p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-colors"
                    title="Conversar"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </GlassSurface>
    </div>
  );
};
