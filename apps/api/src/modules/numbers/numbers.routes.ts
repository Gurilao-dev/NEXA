import { FastifyInstance } from 'fastify';
import { NumbersService } from './numbers.service.js';
import { NumberStatus } from '@nexa/types';

export async function numbersRoutes(fastify: FastifyInstance) {
  // Catálogo público de números virtuais com filtros
  fastify.get('/v1/mobile/numbers', async (request) => {
    const query = request.query as { ddd?: string; pattern?: string; status?: NumberStatus };
    const numbers = await NumbersService.listNumbers(query);
    return { items: numbers, total: numbers.length };
  });

  // Detalhes do número virtual
  fastify.get('/v1/mobile/numbers/:id', async (request) => {
    const { id } = request.params as { id: string };
    const number = await NumbersService.getNumber(id);
    return number;
  });
}
