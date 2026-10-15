import { v4 as uuidv4 } from 'uuid';
import { db } from '../../config/firebase.js';
import { AppError } from '../../middleware/errorHandler.js';
import { PaymentReceipt, Wallet, WalletLedgerEntry } from '@nexa/types';

const INITIAL_GRANT_CENTS = 30000; // R$ 300,00

export class WalletsService {
  /**
   * Obtém ou inicializa uma carteira de visitante com concessão única de R$ 300,00.
   */
  static async getOrCreateWallet(guestUid: string): Promise<Wallet> {
    const walletRef = db.collection('wallets').doc(guestUid);

    return db.runTransaction(async (transaction: any) => {
      const doc = await transaction.get(walletRef);

      if (doc.exists) {
        return doc.data() as Wallet;
      }

      const now = new Date().toISOString();
      const initialWallet: Wallet = {
        walletId: guestUid,
        guestUid,
        balanceCents: INITIAL_GRANT_CENTS,
        initialGrantGiven: true,
        createdAt: now,
        updatedAt: now,
      };

      transaction.set(walletRef, initialWallet);

      // Registra entrada no ledger
      const ledgerRef = db.collection('walletLedger').doc(uuidv4());
      const initialLedgerEntry: WalletLedgerEntry = {
        entryId: ledgerRef.id,
        walletId: guestUid,
        operationId: `op_init_${guestUid}`,
        type: 'INITIAL_GRANT',
        amountCents: INITIAL_GRANT_CENTS,
        balanceAfterCents: INITIAL_GRANT_CENTS,
        description: 'Concessão inicial de créditos de demonstração',
        createdAt: now,
      };

      transaction.set(ledgerRef, initialLedgerEntry);

      return initialWallet;
    });
  }

  /**
   * Consulta os dados da carteira do visitante autenticado.
   */
  static async getWallet(guestUid: string): Promise<Wallet> {
    return this.getOrCreateWallet(guestUid);
  }

  /**
   * Extrato paginado com histórico imutável de transações.
   */
  static async getTransactions(guestUid: string): Promise<WalletLedgerEntry[]> {
    const querySnapshot = await db
      .collection('walletLedger')
      .where('walletId', '==', guestUid)
      .get();

    const entries = querySnapshot.docs.map((doc: any) => doc.data() as WalletLedgerEntry);
    // Ordena mais recente primeiro
    return entries.sort((a: WalletLedgerEntry, b: WalletLedgerEntry) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  /**
   * Consulta de recibo com selo indelével de simulação.
   */
  static async getReceipt(receiptId: string): Promise<PaymentReceipt> {
    const doc = await db.collection('paymentReceipts').doc(receiptId).get();
    if (!doc.exists) {
      throw new AppError('Comprovante não encontrado.', 404, 'RECEIPT_NOT_FOUND');
    }
    return doc.data() as PaymentReceipt;
  }

  /**
   * Transferência Pix interna simulada entre carteiras demo.
   */
  static async internalPixTransfer(
    senderUid: string,
    recipientKey: string,
    amountCents: number,
    description = 'Pix simulado NEXA',
    idempotencyKey?: string
  ): Promise<PaymentReceipt> {
    if (amountCents <= 0) {
      throw new AppError('O valor deve ser um número positivo em centavos.', 400, 'INVALID_AMOUNT');
    }

    if (senderUid === recipientKey) {
      throw new AppError('Não é permitido transferir para a própria carteira.', 400, 'SELF_TRANSFER_PROHIBITED');
    }

    // Verifica idempotência
    if (idempotencyKey) {
      const existingOp = await db.collection('walletOperations').doc(idempotencyKey).get();
      if (existingOp.exists) {
        return existingOp.data().receipt as PaymentReceipt;
      }
    }

    const senderRef = db.collection('wallets').doc(senderUid);
    const recipientRef = db.collection('wallets').doc(recipientKey);

    return db.runTransaction(async (transaction: any) => {
      const senderDoc = await transaction.get(senderRef);
      if (!senderDoc.exists) {
        throw new AppError('Carteira de origem não encontrada.', 404, 'WALLET_NOT_FOUND');
      }

      const senderWallet = senderDoc.data() as Wallet;
      if (senderWallet.balanceCents < amountCents) {
        throw new AppError('Saldo insuficiente para realizar a transferência simulada.', 422, 'INSUFFICIENT_BALANCE');
      }

      // Garante que o destinatário existe ou cria carteira receptora
      let recipientDoc = await transaction.get(recipientRef);
      let recipientBalance = 0;
      const now = new Date().toISOString();

      if (!recipientDoc.exists) {
        const newRecipient: Wallet = {
          walletId: recipientKey,
          guestUid: recipientKey,
          balanceCents: amountCents,
          initialGrantGiven: false,
          createdAt: now,
          updatedAt: now,
        };
        transaction.set(recipientRef, newRecipient);
        recipientBalance = amountCents;
      } else {
        const recipientWallet = recipientDoc.data() as Wallet;
        recipientBalance = recipientWallet.balanceCents + amountCents;
        transaction.update(recipientRef, {
          balanceCents: recipientBalance,
          updatedAt: now,
        });
      }

      const senderBalanceAfter = senderWallet.balanceCents - amountCents;
      transaction.update(senderRef, {
        balanceCents: senderBalanceAfter,
        updatedAt: now,
      });

      // Cria entradas imutáveis de débito e crédito no ledger
      const opId = `op_transfer_${uuidv4()}`;
      const debitRef = db.collection('walletLedger').doc(uuidv4());
      const creditRef = db.collection('walletLedger').doc(uuidv4());

      const debitEntry: WalletLedgerEntry = {
        entryId: debitRef.id,
        walletId: senderUid,
        operationId: opId,
        type: 'INTERNAL_PIX_SEND',
        amountCents: -amountCents,
        balanceAfterCents: senderBalanceAfter,
        destinationUid: recipientKey,
        description,
        createdAt: now,
      };

      const creditEntry: WalletLedgerEntry = {
        entryId: creditRef.id,
        walletId: recipientKey,
        operationId: opId,
        type: 'INTERNAL_PIX_RECEIVE',
        amountCents: amountCents,
        balanceAfterCents: recipientBalance,
        sourceUid: senderUid,
        description,
        createdAt: now,
      };

      transaction.set(debitRef, debitEntry);
      transaction.set(creditRef, creditEntry);

      // Comprovante Simulado
      const receiptRef = db.collection('paymentReceipts').doc(uuidv4());
      const receipt: PaymentReceipt = {
        receiptId: receiptRef.id,
        operationId: opId,
        payerUid: senderUid,
        payeeUid: recipientKey,
        amountCents,
        description,
        isSimulation: true,
        watermark: 'SIMULADO / SEM VALOR FISCAL OU BANCÁRIO',
        timestamp: now,
      };

      transaction.set(receiptRef, receipt);

      if (idempotencyKey) {
        transaction.set(db.collection('walletOperations').doc(idempotencyKey), {
          receipt,
          createdAt: now,
        });
      }

      return receipt;
    });
  }
}
