import React, { useState } from 'react';
import { GlassSurface, GlassButton, GlassInput } from '@nexa/ui';
import { Users, AlertCircle, X, Plus, Check } from 'lucide-react';

interface NewGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateGroup: (title: string, memberUids: string[], photoUrl?: string) => Promise<any>;
  contacts: any[];
}

export const NewGroupModal: React.FC<NewGroupModalProps> = ({
  isOpen,
  onClose,
  onCreateGroup,
  contacts,
}) => {
  const [title, setTitle] = useState('');
  const [selectedUids, setSelectedUids] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleMember = (uid: string) => {
    setSelectedUids((prev) =>
      prev.includes(uid) ? prev.filter((id) => id !== uid) : [...prev, uid]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Informe o título do grupo.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await onCreateGroup(title.trim(), selectedUids);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Falha ao criar grupo');
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
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-display text-white">Novo Grupo</h3>
              <p className="text-xs text-slate-400">Crie um canal de comunicação compartilhado</p>
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Nome do Grupo
            </label>
            <GlassInput
              value={title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
              placeholder="Ex: Operações Alpha"
              required
              className="w-full text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Selecionar Membros ({selectedUids.length} selecionados)
            </label>
            {contacts.length === 0 ? (
              <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-center text-xs text-slate-400">
                Você ainda não possui contatos salvos. Você poderá convidar novos membros através do link do grupo.
              </div>
            ) : (
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {contacts.map((contact) => {
                  const isSelected = contact.targetUid && selectedUids.includes(contact.targetUid);
                  return (
                    <button
                      key={contact.contactId}
                      type="button"
                      disabled={!contact.targetUid}
                      onClick={() => contact.targetUid && toggleMember(contact.targetUid)}
                      className={`w-full p-2.5 rounded-xl border text-left transition-colors flex items-center justify-between ${
                        isSelected
                          ? 'bg-emerald-500/15 border-emerald-500/40 text-white'
                          : 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      <div>
                        <div className="text-sm font-medium">{contact.nickname}</div>
                        <div className="font-mono text-xs text-slate-400">{contact.nexaNumber}</div>
                      </div>
                      <div className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                        isSelected ? 'bg-emerald-500 border-emerald-400 text-slate-950' : 'border-white/20'
                      }`}>
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <GlassButton
            type="submit"
            variant="primary"
            disabled={submitting}
            className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-medium flex items-center justify-center gap-2 rounded-xl shadow-lg shadow-purple-950/40"
          >
            <Plus className="w-4 h-4" />
            <span>{submitting ? 'Criando Grupo...' : 'Criar Grupo'}</span>
          </GlassButton>
        </form>
      </GlassSurface>
    </div>
  );
};
