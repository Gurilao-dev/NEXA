/**
 * NEXA Ecosystem — Tipos do Catálogo de Números Virtuais (NEXA Mobile)
 */

export type NumberStatus = 
  | 'AVAILABLE' 
  | 'RESERVED' 
  | 'SOLD' 
  | 'ACTIVE'
  | 'SUSPENDED';

export type NumberPattern = 'standard' | 'golden' | 'platinum' | 'consecutive';

export interface VirtualNumber {
  numberId: string;
  e164: string;           // ex: +5511999998888
  formatted: string;      // ex: +55 (11) 99999-8888
  ddd: string;            // ex: 11
  pattern: NumberPattern;
  priceCents: number;     // ex: 2990 (R$ 29,90)
  status: NumberStatus;
  ownerUid?: string | null;
  reservedUntil?: string | null;
  reservedByUid?: string | null;
  createdAt: string;
  updatedAt: string;
}
