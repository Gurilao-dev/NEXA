import React, { useState } from 'react';
import { GlassSurface, GlassButton, GlassInput } from '@nexa/ui';
import { VirtualNumber } from '@nexa/types';
import { MessageSquare, Smartphone, Sparkles, AlertCircle } from 'lucide-react';

interface ActivateChatModalProps {
  ownedNumbers: VirtualNumber[];
  onActivate: (numberId: string, displayName: string, about?: string) => Promise<void>;
  defaultDisplayName?: string;
  error?: string | null;
}

export const ActivateChatModal: React.FC<ActivateChatModalProps> = ({
  ownedNumbers,
  onActivate,
  defaultDisplayName = '',
  error,
}) => {
  const [selectedNumberId, setSelectedNumberId] = useState<string>(ownedNumbers[0]?.numberId || '');
  const [displayName, setDisplayName] = useState(defaultDisplayName || 'Operador NEXA');
  const [about, setAbout] = useState('Olá! Estou conectado ao NEXA Chat.');
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNumberId) {
      setLocalError('Selecione uma linha virtual para vincular ao seu perfil.');
      return;
    }
    if (!displayName.trim()) {
      setLocalError('Informe seu nome de exibição no chat.');
      return;
    }

    setSubmitting(true);
    setLocalError(null);
    try {
      await onActivate(selectedNumberId, displayName.trim(), about.trim());
    } catch (err: any) {
      setLocalError(err.message || 'Falha ao ativar perfil');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xl">
      <GlassSurface
        variant="card"
        className="max-w-md w-full p-6 sm:p-8 rounded-3xl border border-emerald-500/30 shadow-2xl shadow-emerald-950/50"
      >
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/10 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <MessageSquare className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold font-display text-white mb-2">
            Ativação do NEXA Chat
          </h2>
          <p className="text-sm text-slate-300">
            Vincule sua linha virtual para iniciar a troca de mensagens com criptografia ponta a ponta.
          </p>
        </div>

        {(localError || error) && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{localError || error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Selecione a Linha Virtual
            </label>
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {ownedNumbers.map((num) => {
                const isSelected = selectedNumberId === num.numberId;
                return (
                  <button
                    key={num.numberId}
                    type="button"
                    onClick={() => setSelectedNumberId(num.numberId)}
                    className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-emerald-500/15 border-emerald-500/50 text-white shadow-sm shadow-emerald-500/10'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Smartphone className={`w-4 h-4 ${isSelected ? 'text-emerald-400' : 'text-slate-400'}`} />
                      <div>
                        <div className="font-mono text-sm font-semibold">{num.formatted}</div>
                        <div className="text-[11px] text-slate-400">DDD {num.ddd} • {num.pattern}</div>
                      </div>
                    </div>
                    {isSelected && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium">
                        Ativa
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Nome de Exibição
            </label>
            <GlassInput
              value={displayName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDisplayName(e.target.value)}
              placeholder="Como seus contatos vão te ver"
              required
              className="w-full text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Recado / Status
            </label>
            <GlassInput
              value={about}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAbout(e.target.value)}
              placeholder="Ex: Conectado via NEXA Mesh"
              className="w-full text-sm"
            />
          </div>

          <GlassButton
            type="submit"
            variant="primary"
            disabled={submitting}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium flex items-center justify-center gap-2 rounded-2xl shadow-lg shadow-emerald-950/50 mt-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>{submitting ? 'Ativando Linha...' : 'Conectar ao NEXA Chat'}</span>
          </GlassButton>
        </form>
      </GlassSurface>
    </div>
  );
};
