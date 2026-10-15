import React from 'react';
import { BrandLogo, GlassButton } from '@nexa/ui';
import { useAuth } from '../context/AuthContext.js';
import { Smartphone, LogIn, LogOut, MessageSquare, UserCheck, Shield } from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onSelectTab }) => {
  const { user, loginWithGoogle, logout } = useAuth();
  const chatUrl = import.meta.env.VITE_CHAT_URL || 'http://localhost:5175';

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-slate-950/70 border-b border-white/[0.08]">
      {/* Banner de Aviso de Linha Fictícia */}
      <div className="bg-indigo-950/40 border-b border-indigo-500/20 px-4 py-1.5 text-center flex items-center justify-center gap-2 text-xs font-semibold text-indigo-300">
        <Shield className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
        <span>LINHAS VIRTUAIS EXCLUSIVAS DO ECOSSISTEMA — NÃO OPERAM NA REDE PÚBLICA DE TELEFONIA</span>
      </div>

      <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-3.5 flex items-center justify-between">
        <BrandLogo variant="mobile" size="md" />

        {/* Links Centrais de Navegação */}
        <nav className="hidden md:flex items-center gap-1 p-1 rounded-2xl bg-white/[0.04] border border-white/10 text-xs">
          <button
            onClick={() => onSelectTab('landing')}
            className={`px-4 py-2 rounded-xl font-medium transition-all ${
              currentTab === 'landing'
                ? 'bg-gradient-to-r from-sky-500/80 to-indigo-600/80 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Início
          </button>

          <button
            onClick={() => onSelectTab('catalog')}
            className={`px-4 py-2 rounded-xl font-medium transition-all ${
              currentTab === 'catalog'
                ? 'bg-gradient-to-r from-sky-500/80 to-indigo-600/80 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Explorar Números
          </button>

          {user && (
            <>
              <button
                onClick={() => onSelectTab('my-numbers')}
                className={`px-4 py-2 rounded-xl font-medium transition-all ${
                  currentTab === 'my-numbers'
                    ? 'bg-gradient-to-r from-sky-500/80 to-indigo-600/80 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Meus Números
              </button>

              <button
                onClick={() => onSelectTab('account')}
                className={`px-4 py-2 rounded-xl font-medium transition-all ${
                  currentTab === 'account'
                    ? 'bg-gradient-to-r from-sky-500/80 to-indigo-600/80 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Minha Conta
              </button>
            </>
          )}
        </nav>

        {/* Ações da Direita */}
        <div className="flex items-center gap-2.5">
          {/* Deep-link Direto para o NEXA Chat */}
          <a
            href={chatUrl}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300 text-xs font-semibold transition-all hover:scale-105 active:scale-95"
            title="Abrir NEXA Chat com sua linha ativa"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Abrir NEXA Chat</span>
          </a>

          {user ? (
            <div className="flex items-center gap-2">
              <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.06] border border-white/10 text-xs text-slate-200">
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-medium truncate max-w-[120px]">{user.displayName}</span>
              </div>

              <GlassButton
                variant="ghost"
                size="sm"
                icon={<LogOut className="w-3.5 h-3.5 text-slate-400" />}
                onClick={logout}
                title="Sair da conta"
              >
                Sair
              </GlassButton>
            </div>
          ) : (
            <GlassButton
              variant="primary"
              size="sm"
              icon={<LogIn className="w-3.5 h-3.5" />}
              onClick={loginWithGoogle}
            >
              Entrar com Google
            </GlassButton>
          )}
        </div>
      </div>
    </header>
  );
};
