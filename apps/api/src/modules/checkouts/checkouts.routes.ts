import { FastifyInstance } from 'fastify';
import { requireAuth } from '../../middleware/auth.js';
import { CheckoutsService } from './checkouts.service.js';
import { confirmCheckoutSchema } from '@nexa/validation';

export async function checkoutsRoutes(fastify: FastifyInstance) {
  // Prévia pública mínima para a tela de pagamento do NEXA Pay
  fastify.get('/v1/pay/checkouts/:ticket', async (request) => {
    const { ticket } = request.params as { ticket: string };
    const preview = await CheckoutsService.getCheckoutPreview(ticket);
    return preview;
  });

  // Confirmação e liquidação atômica do checkout (requer sessão de visitante ou usuário)
  fastify.post('/v1/pay/checkouts/:id/confirm', { preHandler: [requireAuth] }, async (request) => {
    const user = request.user!;
    const input = confirmCheckoutSchema.parse(request.body);
    const receipt = await CheckoutsService.confirmCheckout(user.uid, input.ticket, input.idempotencyKey);
    return receipt;
  });
}
