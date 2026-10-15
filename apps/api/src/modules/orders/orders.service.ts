import { v4 as uuidv4 } from 'uuid';
import { db } from '../../config/firebase.js';
import { AppError } from '../../middleware/errorHandler.js';
import { TelecomOrder, VirtualNumber } from '@nexa/types';

export class OrdersService {
  /**
   * Cria um pedido na NEXA Mobile e reserva temporariamente o número virtual.
   */
  static async createOrder(
    ownerUid: string,
    numberId: string,
    idempotencyKey: string
  ): Promise<{ orderId: string; checkoutTicket: string; expiresAt: string; amountCents: number }> {
    // Verificação de idempotência
    const existingOp = await db.collection('orderOperations').doc(idempotencyKey).get();
    if (existingOp.exists) {
      return existingOp.data().result;
    }

    const numberRef = db.collection('numbers').doc(numberId);

    return db.runTransaction(async (transaction: any) => {
      const numberDoc = await transaction.get(numberRef);
      if (!numberDoc.exists) {
        throw new AppError('Número virtual não encontrado.', 404, 'NUMBER_NOT_FOUND');
      }

      const number = numberDoc.data() as VirtualNumber;
      const now = new Date();

      // Checa se o número está disponível ou com reserva expirada
      const isReserved = number.status === 'RESERVED' && number.reservedUntil && new Date(number.reservedUntil) > now;
      if (number.status === 'SOLD' || isReserved) {
        throw new AppError(
          'Este número já foi adquirido ou está temporariamente reservado por outro usuário.',
          409,
          'NUMBER_UNAVAILABLE'
        );
      }

      const orderId = `ord_${uuidv4().replace(/-/g, '').substring(0, 16)}`;
      const checkoutTicket = `tkt_${uuidv4().replace(/-/g, '')}`;
      const expiresAt = new Date(now.getTime() + 15 * 60 * 1000).toISOString(); // 15 minutos

      // Atualiza o número para RESERVED
      transaction.update(numberRef, {
        status: 'RESERVED',
        reservedByUid: ownerUid,
        reservedUntil: expiresAt,
        updatedAt: now.toISOString(),
      });

      // Cria o pedido TelecomOrder
      const orderRef = db.collection('orders').doc(orderId);
      const newOrder: TelecomOrder = {
        orderId,
        ownerUid,
        numberId,
        expectedAmountCents: number.priceCents,
        status: 'RESERVED',
        checkoutTicketHash: checkoutTicket,
        checkoutTicketExpiresAt: expiresAt,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      };
      transaction.set(orderRef, newOrder);

      // Cria o registro do checkout para o NEXA Pay
      const checkoutRef = db.collection('checkouts').doc(checkoutTicket);
      transaction.set(checkoutRef, {
        ticket: checkoutTicket,
        orderId,
        numberId,
        ownerUid,
        expectedAmountCents: number.priceCents,
        virtualNumberFormatted: number.formatted,
        status: 'PENDING',
        expiresAt,
        createdAt: now.toISOString(),
      });

      const result = {
        orderId,
        checkoutTicket,
        expiresAt,
        amountCents: number.priceCents,
      };

      // Grava chave de idempotência
      transaction.set(db.collection('orderOperations').doc(idempotencyKey), {
        result,
        createdAt: now.toISOString(),
      });

      return result;
    });
  }

  /**
   * Consulta status de um pedido pertencente ao usuário autenticado.
   */
  static async getOrder(orderId: string, ownerUid: string): Promise<TelecomOrder> {
    const doc = await db.collection('orders').doc(orderId).get();
    if (!doc.exists) {
      throw new AppError('Pedido não encontrado.', 404, 'ORDER_NOT_FOUND');
    }

    const order = doc.data() as TelecomOrder;
    if (order.ownerUid !== ownerUid) {
      throw new AppError('Acesso não autorizado a este pedido.', 403, 'FORBIDDEN');
    }

    return order;
  }

  /**
   * Lista todos os números virtuais ativos de posse do usuário.
   */
  static async getUserNumbers(ownerUid: string): Promise<VirtualNumber[]> {
    const snapshot = await db
      .collection('numbers')
      .where('ownerUid', '==', ownerUid)
      .get();

    return snapshot.docs.map((doc: any) => doc.data() as VirtualNumber);
  }

  /**
   * Define o número principal da conta.
   */
  static async setPrimaryNumber(ownerUid: string, numberId: string): Promise<void> {
    const numberDoc = await db.collection('numbers').doc(numberId).get();
    if (!numberDoc.exists) {
      throw new AppError('Número não encontrado.', 404, 'NUMBER_NOT_FOUND');
    }

    const number = numberDoc.data() as VirtualNumber;
    if (number.ownerUid !== ownerUid || number.status !== 'ACTIVE') {
      throw new AppError('Você não é o proprietário desta linha ativa.', 403, 'FORBIDDEN');
    }

    const userRef = db.collection('users').doc(ownerUid);
    await userRef.set(
      {
        primaryNumberId: numberId,
        primaryNumberFormatted: number.formatted,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  }
}
