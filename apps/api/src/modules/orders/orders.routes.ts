import { FastifyInstance } from 'fastify';
import { requireAuth } from '../../middleware/auth.js';
import { OrdersService } from './orders.service.js';
import { createOrderSchema } from '@nexa/validation';

export async function ordersRoutes(fastify: FastifyInstance) {
  // Criar pedido e reservar número temporariamente
  fastify.post('/v1/mobile/orders', { preHandler: [requireAuth] }, async (request, reply) => {
    const user = request.user!;
    const input = createOrderSchema.parse(request.body);
    const result = await OrdersService.createOrder(user.uid, input.numberId, input.idempotencyKey);
    return reply.status(201).send(result);
  });

  // Consultar status de um pedido
  fastify.get('/v1/mobile/orders/:id', { preHandler: [requireAuth] }, async (request) => {
    const user = request.user!;
    const { id } = request.params as { id: string };
    const order = await OrdersService.getOrder(id, user.uid);
    return order;
  });

  // Listar números do usuário autenticado
  fastify.get('/v1/mobile/me/numbers', { preHandler: [requireAuth] }, async (request) => {
    const user = request.user!;
    const numbers = await OrdersService.getUserNumbers(user.uid);
    return { items: numbers, total: numbers.length };
  });

  // Definir número principal
  fastify.patch('/v1/mobile/me/primary-number', { preHandler: [requireAuth] }, async (request) => {
    const user = request.user!;
    const { numberId } = request.body as { numberId: string };
    await OrdersService.setPrimaryNumber(user.uid, numberId);
    return { success: true, primaryNumberId: numberId };
  });
}
