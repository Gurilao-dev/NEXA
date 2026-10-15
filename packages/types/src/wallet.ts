/**
 * NEXA Ecosystem — Tipos da Carteira e Ledger (NEXA Pay)
 */

export interface Wallet {
  walletId: string;
  guestUid: string;
  balanceCents: number; // Centavos inteiros
  initialGrantGiven: boolean;
  createdAt: string;
  updatedAt: string;
}

export type LedgerTransactionType = 
  | 'INITIAL_GRANT'
  | 'INTERNAL_PIX_SEND'
  | 'INTERNAL_PIX_RECEIVE'
  | 'CHECKOUT_PAYMENT'
  | 'CHECKOUT_REFUND';

export interface WalletLedgerEntry {
  entryId: string;
  walletId: string;
  operationId: string;
  type: LedgerTransactionType;
  amountCents: number; // Positivo para crédito, negativo para débito
  balanceAfterCents: number;
  sourceUid?: string;
  destinationUid?: string;
  orderId?: string;
  description: string;
  createdAt: string;
}

export interface PaymentReceipt {
  receiptId: string;
  operationId: string;
  orderId?: string;
  payerUid: string;
  payeeUid: string;
  amountCents: number;
  description: string;
  isSimulation: true;
  watermark: 'SIMULADO / SEM VALOR FISCAL OU BANCÁRIO';
  timestamp: string;
}
