import { FastifyInstance } from 'fastify';
import { db } from '../../config/firebase.js';

export async function healthRoutes(fastify: FastifyInstance) {
  fastify.get('/health/live', async () => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
    };
  });

  fastify.get('/health/ready', async (request, reply) => {
    try {
      // Teste de leitura básico no Firestore
      await db.collection('_healthcheck').doc('ping').get();
      return {
        status: 'ready',
        database: 'connected',
        timestamp: new Date().toISOString(),
      };
    } catch (err: any) {
      request.log.error(err, 'Health ready check failed');
      return reply.status(503).send({
        status: 'degraded',
        database: 'disconnected',
        error: err.message,
      });
    }
  });

  fastify.get('/v1/public/config', async () => {
    return {
      name: 'NEXA Ecosystem API',
      version: '1.0.0',
      currency: 'BRL',
      isSimulation: true,
      features: {
        mockPix: true,
        virtualNumbers: true,
        realtimeChat: true,
        webrtcCalls: true,
      },
    };
  });
}
