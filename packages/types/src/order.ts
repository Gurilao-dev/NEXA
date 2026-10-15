/**
 * NEXA Ecosystem — Tipos de Pedidos e Checkout Cross-Origin
 */

export type OrderStatus = 
  | 'CREATED'
  | 'RESERVED'
  | 'AWAITING_PAYMENT'
  | 'PAID'
  | 'PAID_PENDING_ACTIVATION'
  | 'ACTIVE'
  | 'EXPIRED'
  | 'FAILED'
  | 'CANCELLED';

export interface TelecomOrder {
  orderId: string;
  ownerUid: string;
  numberId: string;
  expectedAmountCents: number;
  status: OrderStatus;
  checkoutTicketHash?: string;
  checkoutTicketExpiresAt?: string;
  paidAt?: string;
  activatedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CheckoutPreview {
  ticket: string;
  orderId: string;
  itemDescription: string;
  virtualNumberFormatted: string;
  amountCents: number;
  expiresAt: string;
  isSimulation: true;
}
