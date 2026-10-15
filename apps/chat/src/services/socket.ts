import { io, Socket } from 'socket.io-client';
import { Message } from '@nexa/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:10000';

class ChatSocketService {
  private socket: Socket | null = null;
  private currentToken: string | null = null;

  connect(token: string) {
    if (this.socket && this.currentToken === token && this.socket.connected) {
      return;
    }

    if (this.socket) {
      this.socket.disconnect();
    }

    this.currentToken = token;
    this.socket = io(`${API_BASE_URL}/chat`, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('Connected to NEXA Chat realtime server');
    });

    this.socket.on('connect_error', (err) => {
      console.warn('Chat socket connection error:', err.message);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.currentToken = null;
    }
  }

  joinConversation(conversationId: string) {
    if (this.socket?.connected) {
      this.socket.emit('conversation:join', { conversationId });
    }
  }

  leaveConversation(conversationId: string) {
    if (this.socket?.connected) {
      this.socket.emit('conversation:leave', { conversationId });
    }
  }

  sendMessage(
    data: {
      conversationId: string;
      text: string;
      clientMessageId: string;
      replyToMessageId?: string;
    },
    callback?: (response: { status: string; message?: Message; error?: string }) => void
  ) {
    if (this.socket?.connected) {
      this.socket.emit('message:send', data, callback);
    } else {
      callback?.({ status: 'error', error: 'Sem conexão em tempo real com o servidor' });
    }
  }

  startTyping(conversationId: string) {
    if (this.socket?.connected) {
      this.socket.emit('typing:start', { conversationId });
    }
  }

  stopTyping(conversationId: string) {
    if (this.socket?.connected) {
      this.socket.emit('typing:stop', { conversationId });
    }
  }

  sendReadReceipt(conversationId: string, messageIds: string[]) {
    if (this.socket?.connected && messageIds.length > 0) {
      this.socket.emit('receipt:read', { conversationId, messageIds });
    }
  }

  onNewMessage(listener: (message: Message) => void) {
    if (!this.socket) return () => {};
    this.socket.on('message:new', listener);
    return () => {
      this.socket?.off('message:new', listener);
    };
  }

  onMessageAck(listener: (ack: { clientMessageId: string; messageId: string; status: string; timestamp: string }) => void) {
    if (!this.socket) return () => {};
    this.socket.on('message:ack', listener);
    return () => {
      this.socket?.off('message:ack', listener);
    };
  }

  onTypingStatus(listener: (status: { conversationId: string; userUid: string; isTyping: boolean }) => void) {
    if (!this.socket) return () => {};
    this.socket.on('typing:status', listener);
    return () => {
      this.socket?.off('typing:status', listener);
    };
  }

  onReceiptUpdate(listener: (receipt: { conversationId: string; messageIds: string[]; status: string; readerUid: string }) => void) {
    if (!this.socket) return () => {};
    this.socket.on('receipt:update', listener);
    return () => {
      this.socket?.off('receipt:update', listener);
    };
  }

  isConnected(): boolean {
    return Boolean(this.socket?.connected);
  }
}

export const chatSocket = new ChatSocketService();
