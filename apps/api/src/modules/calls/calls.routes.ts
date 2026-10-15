import { FastifyInstance } from 'fastify';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../../config/firebase.js';
import { requireAuth } from '../../middleware/auth.js';
import { callInviteSchema } from '@nexa/validation';
import { CallSession } from '@nexa/types';

export async function callsRoutes(fastify: FastifyInstance) {
  // Iniciar registro de chamada
  fastify.post('/v1/calls', { preHandler: [requireAuth] }, async (request, reply) => {
    const user = request.user!;
    const input = callInviteSchema.parse(request.body);
    const callId = `call_${uuidv4().replace(/-/g, '').substring(0, 16)}`;
    const now = new Date().toISOString();

    const session: CallSession = {
      callId,
      callerUid: user.uid,
      targetUid: input.targetUid,
      callType: input.callType,
      state: 'RINGING',
      startedAt: now,
      createdAt: now,
    };

    await db.collection('calls').doc(callId).set(session);
    return reply.status(201).send(session);
  });

  // Histórico de chamadas
  fastify.get('/v1/calls/history', { preHandler: [requireAuth] }, async (request) => {
    const user = request.user!;
    const callsSnapshot = await db
      .collection('calls')
      .where('callerUid', '==', user.uid)
      .get();

    const calls = callsSnapshot.docs.map((doc: any) => doc.data() as CallSession);
    return { items: calls, total: calls.length };
  });

  // Encerrar chamada
  fastify.post('/v1/calls/:id/end', { preHandler: [requireAuth] }, async (request) => {
    const { id } = request.params as { id: string };
    const { durationSeconds } = (request.body as { durationSeconds?: number }) || {};
    const now = new Date().toISOString();

    await db.collection('calls').doc(id).update({
      state: 'ENDED',
      durationSeconds: durationSeconds || 0,
      endedAt: now,
    });

    return { success: true, callId: id };
  });
}
