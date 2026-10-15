import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import sensible from '@fastify/sensible';
import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { healthRoutes } from './modules/health/health.routes.js';
import { authRoutes } from './modules/auth/auth.routes.js';
import { walletsRoutes } from './modules/wallets/wallets.routes.js';
import { numbersRoutes } from './modules/numbers/numbers.routes.js';
import { ordersRoutes } from './modules/orders/orders.routes.js';
import { checkoutsRoutes } from './modules/checkouts/checkouts.routes.js';
import { chatRoutes } from './modules/chat/chat.routes.js';
import { callsRoutes } from './modules/calls/calls.routes.js';
import { mediaRoutes } from './modules/media/media.routes.js';

export async function buildApp() {
  const fastify = Fastify({
    logger: {
      level: env.LOG_LEVEL,
      transport:
        env.NODE_ENV === 'development'
          ? {
              target: 'pino-pretty',
              options: {
                translateTime: 'HH:MM:ss Z',
                ignore: 'pid,hostname',
              },
            }
          : undefined,
    },
    disableRequestLogging: false,
  });

  // Plugins de Segurança e Infraestrutura
  await fastify.register(sensible);
  
  await fastify.register(helmet, {
    contentSecurityPolicy: false, // Gerenciado nos frontends
  });

  await fastify.register(cors, {
    origin: (origin, cb) => {
      // Permite requisições sem origin (ex: mobile apps, curl, healthcheck)
      if (!origin) return cb(null, true);

      const allowed = [
        env.FRONTEND_PAY_ORIGIN,
        env.FRONTEND_MOBILE_ORIGIN,
        env.FRONTEND_CHAT_ORIGIN,
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5175',
      ];

      if (allowed.includes(origin) || origin.endsWith('.vercel.app') || origin.endsWith('.onrender.com')) {
        return cb(null, true);
      }
      return cb(new Error('Origem não autorizada pelo CORS.'), false);
    },
    credentials: true,
  });

  await fastify.register(rateLimit, {
    max: 120,
    timeWindow: '1 minute',
  });

  // Formatador Universal de Erros (RFC 7807)
  fastify.setErrorHandler(errorHandler);

  // Registro de Módulos de Rotas
  await fastify.register(healthRoutes);
  await fastify.register(authRoutes);
  await fastify.register(walletsRoutes);
  await fastify.register(numbersRoutes);
  await fastify.register(ordersRoutes);
  await fastify.register(checkoutsRoutes);
  await fastify.register(chatRoutes);
  await fastify.register(callsRoutes);
  await fastify.register(mediaRoutes);

  return fastify;
}
