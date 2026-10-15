import React, { useState, useEffect, useCallback } from 'react';
import { payApi } from './services/api.js';
import { Wallet, WalletLedgerEntry, PaymentReceipt } from '@nexa/types';
import { ColdStartOverlay, BackendState, GlassToast } from '@nexa/ui';
import { Header } from './components/Header.js';
import { BalanceCard } from './components/BalanceCard.js';
import { PixModal } from './components/PixModal.js';
import { StatementView } from './components/StatementView.js';
import { ReceiptModal } from './components/ReceiptModal.js';
import { CheckoutView } from './components/CheckoutView.js';
import { OnboardingModal } from './components/OnboardingModal.js';

export const App: React.FC = () => {
  const [backendState, setBackendState] = useState<BackendState>('backendStarting');
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<WalletLedgerEntry[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);

  // URL Checkout Ticket
  const [checkoutTicket, setCheckoutTicket] = useState<string | null>(null);

  // Modais e Exibições
  const [pixModalOpen, setPixModalOpen] = useState(false);
  const [pixModalTab, setPixModalTab] = useState<'send' | 'receive'>('send');
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState<PaymentReceipt | null>(null);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 1. Checagem inicial de cold start e parâmetros de URL
  const initialize = useCallback(async () => {
    if (!navigator.onLine) {
      setBackendState('offline');
      return;
    }

    try {
      await payApi.checkHealth();
      setBackendState('appReady');

      // Carrega ou inicializa a carteira de demonstração
      const walletData = await payApi.getWallet();
      setWallet(walletData);

      // Carrega extrato inicial
      const txData = await payApi.getTransactions();
      setTransactions(txData.items);
    } catch {
      setBackendState('backendStarting');
    }
  }, []);

  useEffect(() => {
    // Detecta ticket na URL
    const params = new URLSearchParams(window.location.search);
    const ticketParam = params.get('ticket');
    if (ticketParam) {
      setCheckoutTicket(ticketParam);
    }

    // Primeiro acesso abre onboarding
    const seenOnboarding = localStorage.getItem('nexa_pay_seen_onboarding');
    if (!seenOnboarding) {
      setOnboardingOpen(true);
      localStorage.setItem('nexa_pay_seen_onboarding', 'true');
    }

    initialize();
  }, [initialize]);

  // Polling automático de cold start se estiver iniciando
  useEffect(() => {
    if (backendState !== 'backendStarting') return;
    const interval = setInterval(async () => {
      try {
        await payApi.checkHealth();
        setBackendState('appReady');
        const walletData = await payApi.getWallet();
        setWallet(walletData);
        const txData = await payApi.getTransactions();
        setTransactions(txData.items);
      } catch {
        // Continua no estado backendStarting
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [backendState]);

  const refreshData = async () => {
    setLoadingTransactions(true);
    try {
      const [walletData, txData] = await Promise.all([
        payApi.getWallet(),
        payApi.getTransactions(),
      ]);
      setWallet(walletData);
      setTransactions(txData.items);
    } catch (err: any) {
      setToastMessage(err.message || 'Falha ao sincronizar dados');
    } finally {
      setLoadingTransactions(false);
    }
  };

  const handleTransferSuccess = (receipt: PaymentReceipt) => {
    setActiveReceipt(receipt);
    setReceiptModalOpen(true);
    setToastMessage('Transferência Pix simulada realizada com sucesso!');
    refreshData();
  };

  const handlePaymentComplete = (receipt: PaymentReceipt) => {
    setActiveReceipt(receipt);
    setReceiptModalOpen(true);
    setToastMessage('Linha virtual adquirida e paga com sucesso!');
    refreshData();
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      {/* Overlay de Despertar do Render */}
      <ColdStartOverlay
        state={backendState}
        variant="pay"
        onRetry={initialize}
      />

      {/* Header com Banner de Simulação */}
      <Header
        guestUid={wallet?.guestUid}
        onOpenHelp={() => setOnboardingOpen(true)}
      />

      {/* Conteúdo Principal */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 flex flex-col gap-6">
        {/* Notificação Toast Flutuante */}
        {toastMessage && (
          <GlassToast
            type="success"
            message={toastMessage}
            onDismiss={() => setToastMessage(null)}
            className="fixed bottom-6 right-6 z-50"
          />
        )}

        {/* 1. Modo Checkout Cross-Origin vindo da NEXA Mobile */}
        {checkoutTicket ? (
          <CheckoutView
            ticket={checkoutTicket}
            balanceCents={wallet?.balanceCents || 0}
            onPaymentComplete={handlePaymentComplete}
            onCancel={() => {
              setCheckoutTicket(null);
              window.history.replaceState({}, '', window.location.pathname);
            }}
          />
        ) : (
          /* 2. Modo Padrão do Banco Simulado */
          <>
            <BalanceCard
              balanceCents={wallet?.balanceCents || 30000}
              guestUid={wallet?.guestUid || 'gst_carregando...'}
              onOpenPixSend={() => {
                setPixModalTab('send');
                setPixModalOpen(true);
              }}
              onOpenPixReceive={() => {
                setPixModalTab('receive');
                setPixModalOpen(true);
              }}
              onOpenStatement={refreshData}
            />

            <StatementView
              entries={transactions}
              onSelectReceipt={async (opId) => {
                try {
                  const receipt = await payApi.getReceipt(opId);
                  setActiveReceipt(receipt);
                  setReceiptModalOpen(true);
                } catch {
                  // Se não achar por opId direto, procura nos comprovantes
                }
              }}
              onRefresh={refreshData}
              loading={loadingTransactions}
            />
          </>
        )}
      </main>

      {/* Modais do Sistema */}
      <PixModal
        isOpen={pixModalOpen}
        onClose={() => setPixModalOpen(false)}
        guestUid={wallet?.guestUid || ''}
        defaultTab={pixModalTab}
        onTransferSuccess={handleTransferSuccess}
      />

      <ReceiptModal
        isOpen={receiptModalOpen}
        onClose={() => setReceiptModalOpen(false)}
        receipt={activeReceipt}
      />

      <OnboardingModal
        isOpen={onboardingOpen}
        onClose={() => setOnboardingOpen(false)}
      />
    </div>
  );
};
