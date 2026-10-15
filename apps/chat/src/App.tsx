import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { ChatProvider, useChat } from './context/ChatContext.js';
import { ColdStartOverlay, BackendState, GlassSurface } from '@nexa/ui';
import { Sidebar } from './components/Sidebar.js';
import { ChatCanvas } from './components/ChatCanvas.js';
import { EmptyChatState } from './components/EmptyChatState.js';
import { NoNumbersGate } from './components/NoNumbersGate.js';
import { ActivateChatModal } from './components/ActivateChatModal.js';
import { NewConversationModal } from './components/NewConversationModal.js';
import { NewGroupModal } from './components/NewGroupModal.js';
import { ContactsModal } from './components/ContactsModal.js';
import { SettingsModal } from './components/SettingsModal.js';
import { CallModal } from './components/CallModal.js';
import { chatApi } from './services/api.js';
import { callsSocket } from './services/callsSocket.js';
import { Shield, Sparkles, LogIn } from 'lucide-react';

function ChatMain() {
  const { user, token, loading: authLoading, loginWithGoogle, logout } = useAuth();
  const {
    profile,
    ownedNumbers,
    isActivated,
    conversations,
    activeConversation,
    messages,
    typingUsers,
    contacts,
    loading: chatLoading,
    activationError,
    activateAccount,
    selectConversation,
    sendMessage,
    startDirectChat,
    createGroup,
    addContact,
    setTyping,
    refreshData,
  } = useChat();

  const [backendState, setBackendState] = useState<BackendState>('backendStarting');

  // Checagem de cold start e prontidão da API
  const initialize = useCallback(async () => {
    if (!navigator.onLine) {
      setBackendState('offline');
      return;
    }
    try {
      await chatApi.checkHealth();
      setBackendState('appReady');
    } catch {
      setBackendState('backendStarting');
    }
  }, []);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (backendState !== 'backendStarting') return;
    const interval = setInterval(async () => {
      try {
        await chatApi.checkHealth();
        setBackendState('appReady');
      } catch {
        // Aguarda despertar
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [backendState]);

  // Modals state
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [isNewGroupOpen, setIsNewGroupOpen] = useState(false);
  const [isContactsOpen, setIsContactsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // WebRTC Call state
  const [isCallOpen, setIsCallOpen] = useState(false);
  const [callType, setCallType] = useState<'AUDIO' | 'VIDEO'>('AUDIO');
  const [callStatus, setCallStatus] = useState<'ringing' | 'connected' | 'ended'>('ringing');
  const [isIncomingCall, setIsIncomingCall] = useState(false);
  const [callTargetUid, setCallTargetUid] = useState<string>('');
  const [currentCallId, setCurrentCallId] = useState<string>('');
  const [callDuration, setCallDuration] = useState(0);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const callTimerRef = useRef<any>(null);

  // Iniciar chamada WebRTC
  const handleStartCall = async (type: 'AUDIO' | 'VIDEO') => {
    if (!activeConversation || !user) return;
    const recipientUid = activeConversation.memberUids.find((u) => u !== user.uid);
    if (!recipientUid) return;

    setCallType(type);
    setIsIncomingCall(false);
    setCallTargetUid(recipientUid);
    const callId = `call_${Date.now()}`;
    setCurrentCallId(callId);
    setCallStatus('ringing');
    setIsCallOpen(true);

    try {
      // Obtém stream local
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: type === 'VIDEO',
      });
      setLocalStream(stream);

      // Sinaliza via Socket.IO
      callsSocket.invite(recipientUid, type, callId);
    } catch (err) {
      console.warn('Dispositivos de mídia não disponíveis, operando em modo virtual:', err);
    }
  };

  // Aceitar chamada
  const handleAcceptCall = async () => {
    setCallStatus('connected');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: callType === 'VIDEO',
      });
      setLocalStream(stream);
      callsSocket.accept(callTargetUid, currentCallId);
    } catch (err) {
      callsSocket.accept(callTargetUid, currentCallId);
    }
  };

  // Recusar ou encerrar
  const handleRejectCall = () => {
    callsSocket.reject(callTargetUid, currentCallId);
    endCallCleanup();
  };

  const handleEndCall = () => {
    callsSocket.end(callTargetUid, currentCallId);
    endCallCleanup();
  };

  const endCallCleanup = () => {
    setIsCallOpen(false);
    setCallStatus('ended');
    setCallDuration(0);
    if (callTimerRef.current) clearInterval(callTimerRef.current);
    localStream?.getTracks().forEach((track) => track.stop());
    setLocalStream(null);
    setRemoteStream(null);
    peerConnectionRef.current?.close();
    peerConnectionRef.current = null;
  };

  // Timer de chamada ativa
  useEffect(() => {
    if (callStatus === 'connected') {
      callTimerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (callTimerRef.current) clearInterval(callTimerRef.current);
    }
    return () => {
      if (callTimerRef.current) clearInterval(callTimerRef.current);
    };
  }, [callStatus]);

  // Listeners de sinalização WebRTC
  useEffect(() => {
    if (!token) return;

    const unsubRinging = callsSocket.onRinging(({ callId, callerUid, callType: incomingType }) => {
      setCurrentCallId(callId);
      setCallTargetUid(callerUid);
      setCallType(incomingType);
      setIsIncomingCall(true);
      setCallStatus('ringing');
      setIsCallOpen(true);
    });

    const unsubAccepted = callsSocket.onAccepted(() => {
      setCallStatus('connected');
    });

    const unsubRejected = callsSocket.onRejected(() => {
      endCallCleanup();
    });

    const unsubEnded = callsSocket.onEnded(() => {
      endCallCleanup();
    });

    return () => {
      unsubRinging?.();
      unsubAccepted?.();
      unsubRejected?.();
      unsubEnded?.();
    };
  }, [token]);

  // Se não autenticado, mostra tela de boas-vindas do chat
  if (!user && !authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#090D16] relative overflow-hidden">
        <div className="absolute w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <GlassSurface
          variant="card"
          className="max-w-md w-full p-8 rounded-3xl border border-emerald-500/30 text-center shadow-2xl shadow-emerald-950/60 relative z-10"
        >
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-slate-950 font-bold text-2xl shadow-xl shadow-emerald-500/20">
            NX
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-3 uppercase tracking-wider">
            NEXA Mesh Messenger
          </span>
          <h1 className="text-3xl font-bold font-display text-white mb-2">
            NEXA Chat
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed mb-6">
            Mensageiro em tempo real integrado às linhas virtuais da <strong>NEXA Mobile</strong> com chamadas WebRTC P2P e privacidade absoluta.
          </p>

          <button
            type="button"
            onClick={loginWithGoogle}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold rounded-2xl shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 transition-transform active:scale-95"
          >
            <LogIn className="w-5 h-5" />
            <span>Conectar ao NEXA Chat</span>
          </button>
        </GlassSurface>
      </div>
    );
  }

  // Gatekeeping: Sem linhas ativas
  const hasNoNumbers = !chatLoading && ownedNumbers.length === 0;

  // Gatekeeping: Possui linhas, mas não ativou perfil
  const needsActivation = !chatLoading && ownedNumbers.length > 0 && !profile;

  return (
    <div className="h-screen w-screen flex flex-col bg-[#090D16] text-slate-100 overflow-hidden">
      {/* Cold start check */}
      <ColdStartOverlay state={backendState} variant="chat" onRetry={initialize} />

      {/* Persistent Simulation Banner */}
      <div className="bg-emerald-950/80 border-b border-emerald-500/30 px-3 py-1 text-center text-[11px] font-semibold tracking-wider text-emerald-300 uppercase flex items-center justify-center gap-2 select-none shrink-0 z-30">
        <Shield className="w-3.5 h-3.5" />
        <span>AMBIENTE DE SIMULAÇÃO TELECOM — REDE PRIVADA NEXA</span>
      </div>

      {/* Main Viewport */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Sidebar: Mobile toggle or desktop column */}
        <div
          className={`${
            activeConversation ? 'hidden md:flex' : 'flex'
          } w-full md:w-auto h-full`}
        >
          <Sidebar
            profile={profile}
            conversations={conversations}
            activeConversation={activeConversation}
            onSelectConversation={selectConversation}
            onOpenNewChat={() => setIsNewChatOpen(true)}
            onOpenNewGroup={() => setIsNewGroupOpen(true)}
            onOpenContacts={() => setIsContactsOpen(true)}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        </div>

        {/* Chat Area */}
        <div
          className={`${
            !activeConversation ? 'hidden md:flex' : 'flex'
          } flex-1 h-full`}
        >
          {activeConversation ? (
            <ChatCanvas
              conversation={activeConversation}
              messages={messages}
              currentProfile={profile}
              typingUsers={typingUsers}
              onSendMessage={sendMessage}
              onSetTyping={setTyping}
              onBack={() => selectConversation(null as any)}
              onStartCall={handleStartCall}
            />
          ) : (
            <EmptyChatState onStartNewChat={() => setIsNewChatOpen(true)} />
          )}
        </div>
      </div>

      {/* Modals & Gatekeepers */}
      {hasNoNumbers && (
        <NoNumbersGate onRefresh={refreshData} loading={chatLoading} />
      )}

      {needsActivation && (
        <ActivateChatModal
          ownedNumbers={ownedNumbers}
          onActivate={activateAccount}
          defaultDisplayName={user?.displayName || 'Operador NEXA'}
          error={activationError}
        />
      )}

      <NewConversationModal
        isOpen={isNewChatOpen}
        onClose={() => setIsNewChatOpen(false)}
        onStartDirect={startDirectChat}
        contacts={contacts}
      />

      <NewGroupModal
        isOpen={isNewGroupOpen}
        onClose={() => setIsNewGroupOpen(false)}
        onCreateGroup={createGroup}
        contacts={contacts}
      />

      <ContactsModal
        isOpen={isContactsOpen}
        onClose={() => setIsContactsOpen(false)}
        contacts={contacts}
        onAddContact={addContact}
        onStartChat={startDirectChat}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        profile={profile}
        onLogout={logout}
      />

      <CallModal
        isOpen={isCallOpen}
        callType={callType}
        contactName={activeConversation?.title || 'Linha NEXA'}
        contactNumber={profile?.formattedNumber || '+55 (11) 9XXXX-XXXX'}
        isIncoming={isIncomingCall}
        onAccept={handleAcceptCall}
        onReject={handleRejectCall}
        onEnd={handleEndCall}
        localStream={localStream}
        remoteStream={remoteStream}
        callDuration={callDuration}
        callStatus={callStatus}
      />
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <ChatProvider>
        <ChatMain />
      </ChatProvider>
    </AuthProvider>
  );
}

export default App;
