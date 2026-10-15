import { FastifyInstance } from 'fastify';
import crypto from 'crypto';
import { requireAuth } from '../../middleware/auth.js';
import { env } from '../../config/env.js';
import { AppError } from '../../middleware/errorHandler.js';

export async function mediaRoutes(fastify: FastifyInstance) {
  // Emissão de autorização e assinatura HMAC de upload seguro para o Cloudinary
  fastify.post('/v1/media/upload-authorizations', { preHandler: [requireAuth] }, async (request) => {
    const user = request.user!;
    const { folder = `nexa/chat/${user.uid}`, fileType = 'image/webp' } = (request.body as any) || {};

    const cloudName = env.CLOUDINARY_CLOUD_NAME || 'nexa-cloud-demo';
    const apiKey = env.CLOUDINARY_API_KEY || 'mock_api_key';
    const apiSecret = env.CLOUDINARY_API_SECRET || 'mock_api_secret';

    const timestamp = Math.floor(Date.now() / 1000);
    const paramsToSign = `folder=${folder}&timestamp=${timestamp}`;

    // Gera assinatura HMAC-SHA1
    const signature = crypto
      .createHash('sha1')
      .update(paramsToSign + apiSecret)
      .digest('hex');

    return {
      cloudName,
      apiKey,
      timestamp,
      signature,
      folder,
      uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
    };
  });
}
