import React, { useState, useEffect } from 'react';
import { mobileApi } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { VirtualNumber } from '@nexa/types';
import { GlassCard, GlassButton } from '@nexa/ui';
import { Smartphone, Star, MessageSquare, ShoppingBag, Check } from 'lucide-react';

interface MyNumbersViewProps {
  onGoToCatalog: () => void;
}

export const MyNumbersView: React.FC<MyNumbersViewProps> = ({ onGoToCatalog }) => {
  const { user, refreshUser } = useAuth();
  const [numbers, setNumbers] = useState<VirtualNumber[]>([]);
  const [loading, setLoading] = useState(true);
  const [settingPrimary, setSettingPrimary] = useState<string | null>(null);

  const chatUrl = import.meta.env.VITE_CHAT_URL || 'http://localhost:5175';

  const fetchNumbers = async () => {
    setLoading(true);
    try {
      const data = await mobileApi.getMyNumbers();
      setNumbers(data.items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNumbers();
  }, []);

  const handleSetPrimary = async (numberId: string) => {
    setSettingPrimary(numberId);
    try {
      await mobileApi.setPrimaryNumber(numberId);
      await refreshUser();
      await fetchNumbers();
    } catch (err) {
      console.error('Falha ao definir número principal:', err);
    } finally {
      setSettingPrimary(null);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />
        <span className="text-sm text-slate-400">Carregando suas linhas ativas...</span>
      </div>
    );
  }

  if (numbers.length === 0) {
    return (
      <GlassCard className="p-10 flex flex-col items-center text-center gap-4 max-w-md mx-auto my-8">
        <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
          <Smartphone className="w-7 h-7" />
        </div>
        <h3 className="text-xl font-bold text-white tracking-tight">Você ainda não possui linhas ativas</h3>
        <p className="text-sm text-slate-400">
          Adquira seu primeiro número virtual no catálogo para desbloquear o acesso ao NEXA Chat.
        </p>
        <GlassButton variant="primary" size="md" icon={<ShoppingBag className="w-4 h-4" />} onClick={onGoToCatalog}>
          Explorar Catálogo de Números
        </GlassButton>
      </GlassCard>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight font-display">Meus Números NEXA</h2>
          <p className="text-sm text-slate-400">Gerencie suas linhas virtuais e selecione a identidade para o mensageiro</p>
        </div>

        <a
          href={chatUrl}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-semibold shadow-lg hover:from-purple-500 hover:to-indigo-500 transition-all active:scale-95"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Abrir NEXA Chat</span>
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {numbers.map((item) => {
          const isPrimary = user?.primaryNumberId === item.numberId;

          return (
            <GlassCard
              key={item.numberId}
              className={`p-6 flex flex-col justify-between gap-5 border transition-all ${
                isPrimary ? 'border-sky-400/50 bg-sky-950/20' : 'border-white/10'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-sky-400">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Linha Ativa</span>
                    <span className="text-xl font-bold font-mono text-white">{item.formatted}</span>
                  </div>
                </div>

                {isPrimary && (
                  <span className="px-2.5 py-1 rounded-full bg-sky-500/20 border border-sky-400/40 text-sky-300 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <Star className="w-3 h-3 text-sky-400 fill-sky-400" /> Principal
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-white/[0.08]">
                <span className="text-xs text-slate-400">
                  Adquirido em {new Date(item.updatedAt).toLocaleDateString('pt-BR')}
                </span>

                <div className="flex items-center gap-2">
                  {!isPrimary && (
                    <GlassButton
                      variant="glass"
                      size="sm"
                      loading={settingPrimary === item.numberId}
                      onClick={() => handleSetPrimary(item.numberId)}
                    >
                      Tornar Principal
                    </GlassButton>
                  )}

                  <a
                    href={chatUrl}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/15 text-purple-300 hover:text-white transition-colors"
                    title="Entrar no chat com este número"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
};
