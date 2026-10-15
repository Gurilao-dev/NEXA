import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext.js';
import { chatApi } from '../services/api.js';
import { chatSocket } from '../services/socket.js';
import { ChatProfile, Conversation, Message, VirtualNumber } from '@nexa/types';

interface ChatContextType {
  profile: ChatProfile | null;
  ownedNumbers: VirtualNumber[];
  isActivated: boolean;
  conversations: Conversation[];
  activeConversation: Conversation | null;
  messages: Message[];
  typingUsers: string[];
  contacts: any[];
  loading: boolean;
  activationError: string | null;
  activateAccount: (numberId: string, displayName: string, about?: string) => Promise<void>;
  selectConversation: (conversation: Conversation) => void;
  sendMessage: (text: string, replyToMessageId?: string, mediaUrl?: string, mediaType?: string) => Promise<void>;
  startDirectChat: (targetNumberFormatted: string) => Promise<Conversation>;
  createGroup: (title: string, memberUids: string[], photoUrl?: string) => Promise<Conversation>;
  addContact: (nexaNumber: string, nickname?: string) => Promise<void>;
  setTyping: (isTyping: boolean) => void;
  refreshData: () => Promise<void>;
}

const ChatContext = createContext<ChatContextType>({} as ChatContextType);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token } = useAuth();
  const [profile, setProfile] = useState<ChatProfile | null>(null);
  const [ownedNumbers, setOwnedNumbers] = useState<VirtualNumber[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activationError, setActivationError] = useState<string | null>(null);

  // Carrega linhas e perfil de chat assim que autenticado
  const refreshData = useCallback(async () => {
    if (!token || !user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // 1. Busca números próprios do usuário na NEXA Mobile
      try {
        const numbersRes = await chatApi.getMyNumbers();
        setOwnedNumbers(numbersRes.items || []);
      } catch (err) {
        console.warn('Erro ao carregar números próprios:', err);
      }

      // 2. Busca perfil de chat
      try {
        const chatProf = await chatApi.getProfile();
        setProfile(chatProf);

        // 3. Busca conversas e contatos
        const [convRes, contRes] = await Promise.all([
          chatApi.listConversations(),
          chatApi.getContacts(),
        ]);
        setConversations(convRes.items || []);
        setContacts(contRes.items || []);
      } catch (err: any) {
        if (err.status === 404 || err.code === 'CHAT_PROFILE_NOT_FOUND') {
          setProfile(null);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [token, user]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Carrega mensagens ao selecionar conversa e conecta à sala Socket.IO
  useEffect(() => {
    if (!activeConversation) {
      setMessages([]);
      return;
    }

    chatSocket.joinConversation(activeConversation.conversationId);

    chatApi.getMessages(activeConversation.conversationId).then((res) => {
      setMessages(res.items || []);
      // Marca como lidas se houver mensagens não lidas
      const unreadIds = res.items
        .filter((m) => m.senderUid !== user?.uid && m.status !== 'READ')
        .map((m) => m.messageId);
      if (unreadIds.length > 0) {
        chatSocket.sendReadReceipt(activeConversation.conversationId, unreadIds);
      }
    }).catch(console.error);

    return () => {
      chatSocket.leaveConversation(activeConversation.conversationId);
      setTypingUsers([]);
    };
  }, [activeConversation, user?.uid]);

  // Listeners de Socket.IO em tempo real
  useEffect(() => {
    if (!token) return;

    // Nova mensagem recebida
    const unsubNewMsg = chatSocket.onNewMessage((newMsg) => {
      // Se a mensagem pertence à conversa ativa
      if (activeConversation && newMsg.conversationId === activeConversation.conversationId) {
        setMessages((prev) => {
          // Deduplica por messageId ou por clientMessageId
          if (prev.some((m) => m.messageId === newMsg.messageId || (newMsg.clientMessageId && m.clientMessageId === newMsg.clientMessageId))) {
            return prev.map((m) => (m.clientMessageId === newMsg.clientMessageId ? newMsg : m));
          }
          return [...prev, newMsg];
        });

        // Envia recibo de leitura se recebida de outrem
        if (newMsg.senderUid !== user?.uid) {
          chatSocket.sendReadReceipt(activeConversation.conversationId, [newMsg.messageId]);
        }
      }

      // Atualiza lista de conversas com a última mensagem
      setConversations((prev) => {
        return prev.map((conv) => {
          if (conv.conversationId === newMsg.conversationId) {
            return {
              ...conv,
              lastMessage: {
                text: newMsg.text,
                senderUid: newMsg.senderUid,
                createdAt: newMsg.createdAt,
              },
              updatedAt: newMsg.createdAt,
            };
          }
          return conv;
        }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      });
    });

    // Confirmação de mensagem enviada (ACK)
    const unsubAck = chatSocket.onMessageAck(({ clientMessageId, messageId, status, timestamp }) => {
      setMessages((prev) =>
        prev.map((m) => {
          if (m.clientMessageId === clientMessageId) {
            return { ...m, messageId, status: status as any, updatedAt: timestamp };
          }
          return m;
        })
      );
    });

    // Indicador de digitação
    const unsubTyping = chatSocket.onTypingStatus(({ conversationId, userUid, isTyping }) => {
      if (activeConversation && activeConversation.conversationId === conversationId) {
        setTypingUsers((prev) => {
          if (isTyping) {
            return prev.includes(userUid) ? prev : [...prev, userUid];
          } else {
            return prev.filter((id) => id !== userUid);
          }
        });
      }
    });

    // Recibo de leitura atualizado
    const unsubReceipt = chatSocket.onReceiptUpdate(({ conversationId, messageIds }) => {
      if (activeConversation && activeConversation.conversationId === conversationId) {
        setMessages((prev) =>
          prev.map((m) => {
            if (messageIds.includes(m.messageId)) {
              return { ...m, status: 'READ' };
            }
            return m;
          })
        );
      }
    });

    return () => {
      unsubNewMsg?.();
      unsubAck?.();
      unsubTyping?.();
      unsubReceipt?.();
    };
  }, [token, activeConversation, user?.uid]);

  // Ativação da conta
  const activateAccount = async (numberId: string, displayName: string, about?: string) => {
    setActivationError(null);
    try {
      const newProfile = await chatApi.activateChat({ numberId, displayName, about });
      setProfile(newProfile);
      await refreshData();
    } catch (err: any) {
      setActivationError(err.message || 'Falha ao ativar perfil no NEXA Chat');
      throw err;
    }
  };

  // Selecionar conversa
  const selectConversation = (conversation: Conversation) => {
    setActiveConversation(conversation);
  };

  // Enviar mensagem com Optimistic UI
  const sendMessage = async (text: string, replyToMessageId?: string, mediaUrl?: string, mediaType?: string) => {
    if (!activeConversation || !user) return;

    const clientMessageId = `cmsg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const optimisticMsg: Message = {
      messageId: clientMessageId,
      conversationId: activeConversation.conversationId,
      senderUid: user.uid,
      clientMessageId,
      text,
      status: 'SENDING',
      replyToMessageId,
      attachment: mediaUrl ? {
        attachmentId: `att_${Date.now()}`,
        type: (mediaType?.toLowerCase() || 'document') as any,
        cloudinaryPublicId: 'local_upload',
        secureUrl: mediaUrl,
        fileName: text,
        fileSizeBytes: 0,
        mimeType: mediaType === 'IMAGE' ? 'image/webp' : mediaType === 'AUDIO' ? 'audio/webm' : 'application/octet-stream',
      } : undefined,
      createdAt: now,
      updatedAt: now,
    };

    // Adiciona imediatamente na UI
    setMessages((prev) => [...prev, optimisticMsg]);

    // Envia via Socket.IO ou fallback REST
    if (chatSocket.isConnected()) {
      chatSocket.sendMessage({
        conversationId: activeConversation.conversationId,
        text,
        clientMessageId,
        replyToMessageId,
      });
    } else {
      try {
        const persisted = await chatApi.sendMessage(activeConversation.conversationId, {
          text,
          clientMessageId,
          replyToMessageId,
          mediaUrl,
          mediaType,
        });
        setMessages((prev) =>
          prev.map((m) => (m.clientMessageId === clientMessageId ? persisted : m))
        );
      } catch (err: any) {
        setMessages((prev) =>
          prev.map((m) => (m.clientMessageId === clientMessageId ? { ...m, status: 'FAILED' } : m))
        );
      }
    }
  };

  // Iniciar conversa direta informando o número NEXA
  const startDirectChat = async (targetNumberFormatted: string): Promise<Conversation> => {
    const conv = await chatApi.createDirectConversation(targetNumberFormatted);
    setConversations((prev) => {
      if (prev.some((c) => c.conversationId === conv.conversationId)) return prev;
      return [conv, ...prev];
    });
    setActiveConversation(conv);
    return conv;
  };

  // Criar grupo
  const createGroup = async (title: string, memberUids: string[], photoUrl?: string): Promise<Conversation> => {
    const group = await chatApi.createGroup({ title, memberUids, photoUrl });
    setConversations((prev) => [group, ...prev]);
    setActiveConversation(group);
    return group;
  };

  // Adicionar contato
  const addContact = async (nexaNumber: string, nickname?: string) => {
    const contact = await chatApi.addContact(nexaNumber, nickname);
    setContacts((prev) => [...prev, contact]);
  };

  // Controle de digitação
  const setTyping = (isTyping: boolean) => {
    if (!activeConversation) return;
    if (isTyping) {
      chatSocket.startTyping(activeConversation.conversationId);
    } else {
      chatSocket.stopTyping(activeConversation.conversationId);
    }
  };

  return (
    <ChatContext.Provider
      value={{
        profile,
        ownedNumbers,
        isActivated: Boolean(profile),
        conversations,
        activeConversation,
        messages,
        typingUsers,
        contacts,
        loading,
        activationError,
        activateAccount,
        selectConversation,
        sendMessage,
        startDirectChat,
        createGroup,
        addContact,
        setTyping,
        refreshData,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
