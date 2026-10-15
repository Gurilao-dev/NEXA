import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { auth } from '../config/firebase.js';
import { env } from '../config/env.js';
import { ChatService } from '../modules/chat/chat.service.js';

interface AuthenticatedSocket extends Socket {
  user?: {
    uid: string;
    email?: string | null;
  };
}

export function setupSocketIO(httpServer: HttpServer) {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: [
        env.FRONTEND_PAY_ORIGIN,
        env.FRONTEND_MOBILE_ORIGIN,
        env.FRONTEND_CHAT_ORIGIN,
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5175',
      ],
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  // Middleware de Autenticação para Sockets
  const socketAuthMiddleware = async (socket: AuthenticatedSocket, next: (err?: Error) => void) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers.authorization;
    if (!token) {
      return next(new Error('Token de autenticação não fornecido no handshake.'));
    }

    const cleanToken = token.startsWith('Bearer ') ? token.substring(7) : token;

    if (cleanToken.startsWith('mock_') || cleanToken.startsWith('guest_')) {
      const uid = cleanToken.replace(/^(mock_|guest_)/, '');
      socket.user = { uid, email: `${uid}@nexa.local` };
      return next();
    }

    try {
      const decoded = await auth.verifyIdToken(cleanToken);
      socket.user = { uid: decoded.uid, email: decoded.email || null };
      next();
    } catch (err: any) {
      next(new Error('Autenticação do Socket rejeitada: token inválido.'));
    }
  };

  // 1. Namespace: /chat
  const chatNamespace = io.of('/chat');
  chatNamespace.use(socketAuthMiddleware);

  chatNamespace.on('connection', (socket: AuthenticatedSocket) => {
    const userUid = socket.user!.uid;
    socket.join(`user:${userUid}`);

    // Entrar na sala de uma conversa
    socket.on('conversation:join', ({ conversationId }) => {
      socket.join(`conversation:${conversationId}`);
    });

    // Sair da sala de uma conversa
    socket.on('conversation:leave', ({ conversationId }) => {
      socket.leave(`conversation:${conversationId}`);
    });

    // Envio de mensagem com persistência autoritativa e broadcast
    socket.on('message:send', async (data, callback) => {
      try {
        const message = await ChatService.sendMessage(userUid, data);

        // Confirmação para o remetente
        if (typeof callback === 'function') {
          callback({ status: 'sent', message });
        }
        socket.emit('message:ack', {
          clientMessageId: data.clientMessageId,
          messageId: message.messageId,
          status: 'sent',
          timestamp: message.createdAt,
        });

        // Difusão para todos os membros conectados na sala da conversa
        chatNamespace.to(`conversation:${data.conversationId}`).emit('message:new', message);
      } catch (err: any) {
        if (typeof callback === 'function') {
          callback({ status: 'error', error: err.message });
        }
        socket.emit('message:error', {
          clientMessageId: data.clientMessageId,
          error: err.message,
        });
      }
    });

    // Indicador de digitação
    socket.on('typing:start', ({ conversationId }) => {
      socket.to(`conversation:${conversationId}`).emit('typing:status', {
        conversationId,
        userUid,
        isTyping: true,
      });
    });

    socket.on('typing:stop', ({ conversationId }) => {
      socket.to(`conversation:${conversationId}`).emit('typing:status', {
        conversationId,
        userUid,
        isTyping: false,
      });
    });

    // Recibos de leitura
    socket.on('receipt:read', ({ conversationId, messageIds }) => {
      socket.to(`conversation:${conversationId}`).emit('receipt:update', {
        conversationId,
        messageIds,
        status: 'read',
        readerUid: userUid,
      });
    });
  });

  // 2. Namespace: /calls (Sinalização WebRTC)
  const callsNamespace = io.of('/calls');
  callsNamespace.use(socketAuthMiddleware);

  callsNamespace.on('connection', (socket: AuthenticatedSocket) => {
    const userUid = socket.user!.uid;
    socket.join(`user:${userUid}`);

    // Iniciar chamada
    socket.on('call:invite', ({ targetUid, callType, callId }) => {
      callsNamespace.to(`user:${targetUid}`).emit('call:ringing', {
        callId,
        callerUid: userUid,
        callType,
      });
    });

    // Atender chamada
    socket.on('call:accept', ({ targetUid, callId }) => {
      callsNamespace.to(`user:${targetUid}`).emit('call:accepted', { callId, responderUid: userUid });
    });

    // Rejeitar chamada
    socket.on('call:reject', ({ targetUid, callId }) => {
      callsNamespace.to(`user:${targetUid}`).emit('call:rejected', { callId });
    });

    // Troca de SDP Offer / Answer
    socket.on('call:offer', ({ targetUid, callId, sdp }) => {
      callsNamespace.to(`user:${targetUid}`).emit('call:offer', { callId, sdp, senderUid: userUid });
    });

    socket.on('call:answer', ({ targetUid, callId, sdp }) => {
      callsNamespace.to(`user:${targetUid}`).emit('call:answer', { callId, sdp, senderUid: userUid });
    });

    // Troca de candidatos ICE
    socket.on('call:ice', ({ targetUid, callId, candidate }) => {
      callsNamespace.to(`user:${targetUid}`).emit('call:ice', { callId, candidate, senderUid: userUid });
    });

    // Encerrar chamada
    socket.on('call:end', ({ targetUid, callId }) => {
      callsNamespace.to(`user:${targetUid}`).emit('call:ended', { callId });
    });
  });

  return io;
}
