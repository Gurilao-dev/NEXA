import { FastifyInstance } from 'fastify';
import { requireAuth } from '../../middleware/auth.js';
import { WalletsService } from './wallets.service.js';
import { internalPixTransferSchema } from '@nexa/validation';

export async function walletsRoutes(fastify: FastifyInstance) {
  // Consulta de saldo e carteira
  fastify.get('/v1/pay/wallet', { preHandler: [requireAuth] }, async (request) => {
    const user = request.user!;
    const wallet = await WalletsService.getWallet(user.uid);
    return wallet;
  });

  // Extrato paginado
  fastify.get('/v1/pay/transactions', { preHandler: [requireAuth] }, async (request) => {
    const user = request.user!;
    const transactions = await WalletsService.getTransactions(user.uid);
    return { items: transactions, count: transactions.length };
  });

  // Comprovante por ID
  fastify.get('/v1/pay/transactions/:id', { preHandler: [requireAuth] }, async (request) => {
    const { id } = request.params as { id: string };
    const receipt = await WalletsService.getReceipt(id);
    return receipt;
  });

  // Transferência Pix interna simulada
  fastify.post('/v1/pay/transfers', { preHandler: [requireAuth] }, async (request) => {
    const user = request.user!;
    const input = internalPixTransferSchema.parse(request.body);
    const receipt = await WalletsService.internalPixTransfer(
      user.uid,
      input.recipientKey,
      input.amountCents,
      input.description,
      input.idempotencyKey
    );
    return receipt;
  });
}
