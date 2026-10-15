import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { mobileApi } from './services/api.js';
import { VirtualNumber } from '@nexa/types';
import { ColdStartOverlay, BackendState } from '@nexa/ui';
import { Navbar } from './components/Navbar.js';
import { LandingPage } from './components/landing/LandingPage.js';
import { CatalogView } from './components/CatalogView.js';
import { MyNumbersView } from './components/MyNumbersView.js';
import { OrdersView } from './components/OrdersView.js';
import { AccountView } from './components/AccountView.js';
import { NumberDetailModal } from './components/NumberDetailModal.js';

const MainContent: React.FC = () => {
  const { user } = useAuth();
  const [backendState, setBackendState] = useState<BackendState>('backendStarting');
  const [currentTab, setCurrentTab] = useState<string>('landing');
  const [selectedNumber, setSelectedNumber] = useState<VirtualNumber | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [orderIdFromUrl, setOrderIdFromUrl] = useState<string | null>(null);

  // Inicialização e checagem de cold start
  const initialize = useCallback(async () => {
    if (!navigator.onLine) {
      setBackendState('offline');
      return;
    }
    try {
      await mobileApi.checkHealth();
      setBackendState('appReady');
    } catch {
      setBackendState('backendStarting');
    }
  }, []);

  useEffect(() => {
    // Detecta retorno da NEXA Pay via URL (?orderId=...)
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get('orderId');
    if (orderId) {
      setOrderIdFromUrl(orderId);
      setCurrentTab('orders');
    }

    initialize();
  }, [initialize]);

  // Polling automático durante cold start
  useEffect(() => {
    if (backendState !== 'backendStarting') return;
    const interval = setInterval(async () => {
      try {
        await mobileApi.checkHealth();
        setBackendState('appReady');
      } catch {
        // Permanece aguardando
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [backendState]);

  const handleSelectNumber = (num: VirtualNumber) => {
    setSelectedNumber(num);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      {/* Overlay de Despertar do Render */}
      <ColdStartOverlay
        state={backendState}
        variant="mobile"
        onRetry={initialize}
      />

      {/* Navbar Superior */}
      <Navbar currentTab={currentTab} onSelectTab={setCurrentTab} />

      {/* Conteúdo da Aba Ativa */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8">
        {currentTab === 'landing' && <LandingPage onGoToCatalog={() => setCurrentTab('catalog')} />}
        {currentTab === 'catalog' && <CatalogView onSelectNumber={handleSelectNumber} />}
        {currentTab === 'my-numbers' && <MyNumbersView onGoToCatalog={() => setCurrentTab('catalog')} />}
        {currentTab === 'orders' && (
          <OrdersView
            orderIdParam={orderIdFromUrl}
            onViewMyNumbers={() => setCurrentTab('my-numbers')}
          />
        )}
        {currentTab === 'account' && <AccountView />}
      </main>

      {/* Modal de Detalhes e Checkout */}
      <NumberDetailModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        number={selectedNumber}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
};
