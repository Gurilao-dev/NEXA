import { v4 as uuidv4 } from 'uuid';
import { db } from '../../config/firebase.js';
import { AppError } from '../../middleware/errorHandler.js';
import { CheckoutPreview, PaymentReceipt, TelecomOrder, VirtualNumber, Wallet, WalletLedgerEntry } from '@nexa/types';

export class CheckoutsService {
  /**
   * Resolve dados mínimos e seguros para exibição na tela de pagamento da NEXA Pay.
   */
  static async getCheckoutPreview(ticket: string): Promise<CheckoutPreview> {
    const checkoutDoc = await db.collection('checkouts').doc(ticket).get();
    if (!checkoutDoc.exists) {
      throw new AppError('Ticket de checkout não encontrado ou inválido.', 404, 'CHECKOUT_NOT_FOUND');
    }

    const checkout = checkoutDoc.data();
    const now = new Date();

    if (checkout.status === 'PAID') {
      throw new AppError('Este pedido já foi liquidado anteriormente.', 410, 'CHECKOUT_ALREADY_PAID');
    }

    if (new Date(checkout.expiresAt) < now) {
      throw new AppError('O prazo deste checkout expirou.', 410, 'CHECKOUT_EXPIRED');
    }

    return {
      ticket,
      orderId: checkout.orderId,
      itemDescription: 'Ativação de Linha Virtual NEXA (Simulada)',
      virtualNumberFormatted: checkout.virtualNumberFormatted,
      amountCents: checkout.expectedAmountCents,
      expiresAt: checkout.expiresAt,
      isSimulation: true,
    };
  }

  /**
   * Liquidação atômica e provisionamento do número virtual para a conta da operadora.
   */
  static async confirmCheckout(guestUid: string, ticket: string, idempotencyKey: string): Promise<PaymentReceipt> {
    // 1. Verificação de idempotência
    const opRef = db.collection('checkoutOperations').doc(idempotencyKey);
    const existingOp = await opRef.get();
    if (existingOp.exists) {
      return existingOp.data().receipt as PaymentReceipt;
    }

    const checkoutRef = db.collection('checkouts').doc(ticket);
    const walletRef = db.collection('wallets').doc(guestUid);

    return db.runTransaction(async (transaction: any) => {
      // 2. Validação do checkout
      const checkoutDoc = await transaction.get(checkoutRef);
      if (!checkoutDoc.exists) {
        throw new AppError('Ticket de checkout não encontrado.', 404, 'CHECKOUT_NOT_FOUND');
      }

      const checkout = checkoutDoc.data();
      const now = new Date();

      if (checkout.status === 'PAID') {
        throw new AppError('Este checkout já foi pago anteriormente.', 410, 'CHECKOUT_ALREADY_PAID');
      }

      if (new Date(checkout.expiresAt) < now) {
        throw new AppError('O tempo limite de 15 minutos para este checkout expirou.', 410, 'CHECKOUT_EXPIRED');
      }

      // 3. Validação da carteira visitante do NEXA Pay
      const walletDoc = await transaction.get(walletRef);
      if (!walletDoc.exists) {
        throw new AppError('Carteira do visitante não encontrada.', 404, 'WALLET_NOT_FOUND');
      }

      const wallet = walletDoc.data() as Wallet;
      const amountCents = checkout.expectedAmountCents;

      if (wallet.balanceCents < amountCents) {
        throw new AppError(
          `Saldo insuficiente na carteira simulada. Saldo atual: R$ ${(wallet.balanceCents / 100).toFixed(2)}, valor necessário: R$ ${(amountCents / 100).toFixed(2)}.`,
          422,
          'INSUFFICIENT_FUNDS'
        );
      }

      // 4. Validação do pedido e do número
      const orderRef = db.collection('orders').doc(checkout.orderId);
      const orderDoc = await transaction.get(orderRef);
      if (!orderDoc.exists) {
        throw new AppError('Pedido da operadora correspondente não encontrado.', 404, 'ORDER_NOT_FOUND');
      }

      const order = orderDoc.data() as TelecomOrder;
      const numberRef = db.collection('numbers').doc(order.numberId);
      const numberDoc = await transaction.get(numberRef);
      if (!numberDoc.exists) {
        throw new AppError('Número virtual não encontrado.', 404, 'NUMBER_NOT_FOUND');
      }

      const number = numberDoc.data() as VirtualNumber;

      // 5. Execução dos Débitos e Créditos no Ledger
      const newWalletBalance = wallet.balanceCents - amountCents;
      transaction.update(walletRef, {
        balanceCents: newWalletBalance,
        updatedAt: now.toISOString(),
      });

      const opId = `op_chk_${uuidv4()}`;
      const ledgerRef = db.collection('walletLedger').doc(uuidv4());
      const ledgerEntry: WalletLedgerEntry = {
        entryId: ledgerRef.id,
        walletId: guestUid,
        operationId: opId,
        type: 'CHECKOUT_PAYMENT',
        amountCents: -amountCents,
        balanceAfterCents: newWalletBalance,
        orderId: order.orderId,
        description: `Pagamento simulado de linha NEXA ${number.formatted}`,
        createdAt: now.toISOString(),
      };
      transaction.set(ledgerRef, ledgerEntry);

      // 6. Atualização do Pedido e Provisionamento da Linha
      transaction.update(orderRef, {
        status: 'PAID',
        paidAt: now.toISOString(),
        activatedAt: now.toISOString(),
        updatedAt: now.toISOString(),
      });

      transaction.update(numberRef, {
        status: 'ACTIVE',
        ownerUid: order.ownerUid,
        reservedByUid: null,
        reservedUntil: null,
        updatedAt: now.toISOString(),
      });

      // Vincula a linha ao perfil do usuário no Firebase
      const userNumberRef = db.collection('users').doc(order.ownerUid).collection('numbers').doc(number.numberId);
      transaction.set(userNumberRef, {
        numberId: number.numberId,
        formatted: number.formatted,
        e164: number.e164,
        purchasedAt: now.toISOString(),
      });

      // 7. Marca checkout como PAID
      transaction.update(checkoutRef, {
        status: 'PAID',
        paidAt: now.toISOString(),
      });

      // 8. Gera Comprovante Simulado
      const receiptRef = db.collection('paymentReceipts').doc(uuidv4());
      const receipt: PaymentReceipt = {
        receiptId: receiptRef.id,
        operationId: opId,
        orderId: order.orderId,
        payerUid: guestUid,
        payeeUid: 'nexa_telecom_operator',
        amountCents,
        description: `Compra de número virtual NEXA: ${number.formatted}`,
        isSimulation: true,
        watermark: 'SIMULADO / SEM VALOR FISCAL OU BANCÁRIO',
        timestamp: now.toISOString(),
      };
      transaction.set(receiptRef, receipt);

      // 9. Grava Idempotência
      transaction.set(opRef, {
        receipt,
        createdAt: now.toISOString(),
      });

      return receipt;
    });
  }
}
