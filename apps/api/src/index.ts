import { buildApp } from './app.js';
import { setupSocketIO } from './realtime/socket.js';
import { env } from './config/env.js';

async function start() {
  try {
    const fastify = await buildApp();

    // Anexa Socket.IO ao servidor HTTP do Fastify
    setupSocketIO(fastify.server);

    await fastify.listen({
      port: env.PORT,
      host: '0.0.0.0',
    });

    console.log(`🚀 NEXA Ecosystem API ativa em http://0.0.0.0:${env.PORT}`);
    console.log(`📡 Socket.IO escutando em /chat e /calls`);

    const shutdown = async (signal: string) => {
      console.log(`🛑 Recebido sinal ${signal}, encerrando servidor com segurança...`);
      await fastify.close();
      process.exit(0);
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (err) {
    console.error('❌ Falha fatal ao iniciar o servidor:', err);
    process.exit(1);
  }
}

start();
