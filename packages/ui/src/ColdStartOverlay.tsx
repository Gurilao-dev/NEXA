import React, { useState, useEffect } from 'react';
import { BrandLogo } from './BrandLogo.js';
import { GlassButton } from './GlassButton.js';
import { GlassSurface } from './GlassSurface.js';
import { WifiOff, RefreshCw, AlertCircle } from 'lucide-react';
import { cn } from './utils.js';

export type BackendState = 'appReady' | 'backendStarting' | 'backendReady' | 'offline' | 'error';

export interface ColdStartOverlayProps {
  state: BackendState;
  variant?: 'default' | 'pay' | 'mobile' | 'chat';
  onRetry?: () => void;
  errorMessage?: string;
  className?: string;
}

export const ColdStartOverlay: React.FC<ColdStartOverlayProps> = ({
  state,
  variant = 'default',
  onRetry,
  errorMessage,
  className,
}) => {
  const [activeMessageIndex, setActiveMessageIndex] = useState(0);

  const rotatingMessages = [
    'O serviço no Render pode levar até 60 segundos para despertar da suspensão gratuita.',
    'Seus saldos, números virtuais e mensagens permanecem totalmente preservados no banco.',
    'Estabelecendo túnel seguro de WebSocket com a API NEXA...',
    'Quase pronto: validando saúde do cluster e canais de sinalização...',
  ];

  useEffect(() => {
    if (state !== 'backendStarting') return;
    const interval = setInterval(() => {
      setActiveMessageIndex((prev) => (prev + 1) % rotatingMessages.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [state, rotatingMessages.length]);

  if (state === 'appReady') return null;

  return (
    <div
      role="alert"
      aria-live="polite"
      className={cn(
        'fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-2xl select-none',
        'animate-in fade-in duration-300',
        className
      )}
    >
      <GlassSurface
        variant="dense"
        blur="hero"
        glow={true}
        className="w-full max-w-lg p-8 sm:p-10 flex flex-col items-center text-center gap-6 rounded-3xl border border-white/25 shadow-2xl"
      >
        <BrandLogo variant={variant} size="lg" />

        {/* 1. Estado: Despertando / Cold Start */}
        {state === 'backendStarting' && (
          <>
            {/* Anel Líquido Refrativo Indeterminado */}
            <div className="relative w-24 h-24 flex items-center justify-center my-2">
              <div className="absolute inset-0 rounded-full border-4 border-white/10" />
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-sky-400 border-r-indigo-500 animate-spin" />
              <div className="absolute inset-2 rounded-full border-2 border-transparent border-b-purple-400 animate-spin [animation-direction:reverse] [animation-duration:3s]" />
              <div className="w-4 h-4 rounded-full bg-sky-400 animate-ping opacity-75" />
            </div>

            <div className="flex flex-col gap-2">
              <h3 className="text-2xl font-bold text-white tracking-tight">Conectando ao servidor</h3>
              <p className="text-sm text-slate-300 font-medium">
                Nosso servidor pode estar iniciando. Seus dados permanecem salvos.
              </p>
              <div className="h-12 flex items-center justify-center">
                <p className="text-xs text-sky-400/90 font-mono transition-opacity duration-500 leading-relaxed px-4">
                  {rotatingMessages[activeMessageIndex]}
                </p>
              </div>
            </div>

            {onRetry && (
              <GlassButton
                variant="glass"
                size="sm"
                icon={<RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                onClick={onRetry}
                className="mt-2 text-xs"
              >
                Verificar conexão agora
              </GlassButton>
            )}
          </>
        )}

        {/* 2. Estado: Offline */}
        {state === 'offline' && (
          <>
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 my-2">
              <WifiOff className="w-8 h-8" />
            </div>

            <div className="flex flex-col gap-2">
              <h3 className="text-2xl font-bold text-white tracking-tight">Sem conexão com a internet</h3>
              <p className="text-sm text-slate-300">
                Verifique sua rede Wi-Fi ou dados móveis. A interface permanecerá em modo somente leitura.
              </p>
            </div>

            {onRetry && (
              <GlassButton variant="primary" size="md" icon={<RefreshCw className="w-4 h-4" />} onClick={onRetry}>
                Tentar novamente
              </GlassButton>
            )}
          </>
        )}

        {/* 3. Estado: Erro */}
        {state === 'error' && (
          <>
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 my-2">
              <AlertCircle className="w-8 h-8" />
            </div>

            <div className="flex flex-col gap-2">
              <h3 className="text-2xl font-bold text-white tracking-tight">Serviço indisponível temporariamente</h3>
              <p className="text-sm text-slate-300">
                {errorMessage || 'Não foi possível estabelecer contato com a API. Tente novamente em instantes.'}
              </p>
            </div>

            {onRetry && (
              <GlassButton variant="primary" size="md" icon={<RefreshCw className="w-4 h-4" />} onClick={onRetry}>
                Tentar reconectar
              </GlassButton>
            )}
          </>
        )}
      </GlassSurface>
    </div>
  );
};
