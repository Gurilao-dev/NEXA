import { FastifyInstance } from 'fastify';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../../config/firebase.js';
import { requireAuth } from '../../middleware/auth.js';
import { WalletsService } from '../wallets/wallets.service.js';
import { updateProfileSchema } from '@nexa/validation';

export async function authRoutes(fastify: FastifyInstance) {
  // Inicialização de sessão de visitante para NEXA Pay
  fastify.post('/v1/guest/session', async () => {
    const guestUid = `gst_${uuidv4().replace(/-/g, '').substring(0, 16)}`;
    const wallet = await WalletsService.getOrCreateWallet(guestUid);
    const token = `guest_${guestUid}`;

    return {
      guestUid,
      token,
      balanceCents: wallet.balanceCents,
      isGuest: true,
      createdAt: wallet.createdAt,
    };
  });

  // Perfil central do usuário autenticado (Google Auth)
  fastify.get('/v1/me', { preHandler: [requireAuth] }, async (request) => {
    const user = request.user!;
    const userRef = db.collection('users').doc(user.uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      // Criação inicial idempotente do usuário
      const now = new Date().toISOString();
      const newUser = {
        uid: user.uid,
        email: user.email || null,
        displayName: user.displayName || user.email?.split('@')[0] || 'Usuário NEXA',
        photoURL: user.photoURL || null,
        primaryNumberId: null,
        createdAt: now,
        updatedAt: now,
      };
      await userRef.set(newUser);
      return newUser;
    }

    return userDoc.data();
  });

  // Atualização de campos permitidos
  fastify.patch('/v1/me', { preHandler: [requireAuth] }, async (request) => {
    const user = request.user!;
    const input = updateProfileSchema.parse(request.body);
    const userRef = db.collection('users').doc(user.uid);

    const now = new Date().toISOString();
    const updateData: any = { ...input, updatedAt: now };

    await userRef.set(updateData, { merge: true });
    const updated = await userRef.get();
    return updated.data();
  });
}
