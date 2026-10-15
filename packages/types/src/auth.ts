/**
 * NEXA Ecosystem — Tipos de Autenticação e Usuário
 */

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  primaryNumberId?: string;
  createdAt: string; // ISO 8601
  updatedAt: string;
}

export interface GuestSession {
  guestUid: string;
  isGuest: true;
  balanceCents: number;
  createdAt: string;
  expiresAt: string;
}
