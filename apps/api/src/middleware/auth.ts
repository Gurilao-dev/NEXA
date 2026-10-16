import { FastifyReply, FastifyRequest } from 'fastify';
import { auth } from '../config/firebase.js';
import { AppError } from './errorHandler.js';

declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      uid: string;
      email?: string | null;
      displayName?: string | null;
      photoURL?: string | null;
      isGuest?: boolean;
    };
  }
}

export async function requireAuth(request: FastifyRequest, reply: FastifyReply) {
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError(
      'Token de autorização não fornecido.',
      401,
      'AUTH_UNAUTHORIZED',
      'https://nexa.api/errors/unauthorized'
    );
  }

  const token = authHeader.substring(7).trim();

  // 1. Suporte a tokens de visitante para NEXA Pay
  if (token.startsWith('guest_') || token.startsWith('gst_')) {
    const guestUid = token.startsWith('guest_') ? token.replace('guest_', '') : token;
    request.user = {
      uid: guestUid,
      isGuest: true,
    };
    return;
  }

  // 2. Validação padrão Firebase ID Token / Mock Token
  try {
    const decoded = await auth.verifyIdToken(token);
    request.user = {
      uid: decoded.uid,
      email: decoded.email || null,
      displayName: (decoded as any).name || null,
      photoURL: (decoded as any).picture || null,
      isGuest: false,
    };
  } catch (err: any) {
    request.log.warn({ errorCode: err?.code, errorMessage: err?.message }, 'Falha na verificação do token Firebase');
    throw new AppError(
      'Token de autorização inválido ou expirado.',
      401,
      'AUTH_INVALID_TOKEN',
      'https://nexa.api/errors/invalid-token'
    );
  }
}

export async function optionalAuth(request: FastifyRequest, reply: FastifyReply) {
  const authHeader = request.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return;

  const token = authHeader.substring(7).trim();
  if (token.startsWith('guest_') || token.startsWith('gst_')) {
    const guestUid = token.startsWith('guest_') ? token.replace('guest_', '') : token;
    request.user = { uid: guestUid, isGuest: true };
    return;
  }

  try {
    const decoded = await auth.verifyIdToken(token);
    request.user = { uid: decoded.uid, email: decoded.email || null, isGuest: false };
  } catch {
    // Ignora para opcional
  }
}
