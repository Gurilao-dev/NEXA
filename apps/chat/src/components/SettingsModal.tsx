import React, { useState } from 'react';
import { GlassSurface, GlassButton } from '@nexa/ui';
import { Settings, Shield, Bell, Eye, LogOut, X, Smartphone, Check } from 'lucide-react';
import { ChatProfile } from '@nexa/types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: ChatProfile | null;
  onLogout: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  profile,
  onLogout,
}) => {
  const [readReceipts, setReadReceipts] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showOnlineStatus, setShowOnlineStatus] = useState(true);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <GlassSurface
        variant="card"
        className="max-w-md w-full p-6 rounded-3xl border border-emerald-500/30 shadow-2xl shadow-emerald-950/50"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-white/10 flex items-center justify-center text-slate-300">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-display text-white">Configurações</h3>
              <p className="text-xs text-slate-400">Preferências do NEXA Chat</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Perfil */}
        {profile && (
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 mb-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-slate-950 font-bold text-lg shadow-md shadow-emerald-500/20">
              {profile.displayName.substring(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-white truncate">{profile.displayName}</div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
                <Smartphone className="w-3.5 h-3.5" />
                <span>{profile.formattedNumber}</span>
              </div>
              <div className="text-[11px] text-slate-400 truncate mt-0.5">{profile.about}</div>
            </div>
          </div>
        )}

        {/* Preferências */}
        <div className="space-y-3 mb-6">
          <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Privacidade e Alertas
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Eye className="w-4 h-4 text-emerald-400" />
              <div>
                <div className="text-sm text-white font-medium">Recibos de Leitura</div>
                <div className="text-[11px] text-slate-400">Confirmação dupla quando mensagens forem lidas</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setReadReceipts(!readReceipts)}
              className={`w-10 h-6 rounded-full transition-colors relative p-1 ${
                readReceipts ? 'bg-emerald-600' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  readReceipts ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Shield className="w-4 h-4 text-teal-400" />
              <div>
                <div className="text-sm text-white font-medium">Status Online</div>
                <div className="text-[11px] text-slate-400">Permitir que contatos vejam quando você está ativo</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowOnlineStatus(!showOnlineStatus)}
              className={`w-10 h-6 rounded-full transition-colors relative p-1 ${
                showOnlineStatus ? 'bg-emerald-600' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  showOnlineStatus ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Bell className="w-4 h-4 text-purple-400" />
              <div>
                <div className="text-sm text-white font-medium">Sons de Notificação</div>
                <div className="text-[11px] text-slate-400">Tons para envio, recebimento e toques de chamada</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`w-10 h-6 rounded-full transition-colors relative p-1 ${
                soundEnabled ? 'bg-emerald-600' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  soundEnabled ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Encerrar Sessão */}
        <div className="pt-2 border-t border-white/10">
          <GlassButton
            variant="ghost"
            onClick={() => {
              onLogout();
              onClose();
            }}
            className="w-full py-2.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 flex items-center justify-center gap-2 text-sm"
          >
            <LogOut className="w-4 h-4" />
            <span>Desconectar Sessão</span>
          </GlassButton>
        </div>
      </GlassSurface>
    </div>
  );
};
