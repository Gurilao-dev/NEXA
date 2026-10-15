import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(10000),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),

  // Frontends CORS allowlist
  FRONTEND_PAY_ORIGIN: z.string().default('http://localhost:5173'),
  FRONTEND_MOBILE_ORIGIN: z.string().default('http://localhost:5174'),
  FRONTEND_CHAT_ORIGIN: z.string().default('http://localhost:5175'),

  // Firebase Admin
  FIREBASE_PROJECT_ID: z.string().optional(),
  FIREBASE_CLIENT_EMAIL: z.string().optional(),
  FIREBASE_PRIVATE_KEY: z.string().optional(),
  FIRESTORE_EMULATOR_HOST: z.string().optional(),
  FIREBASE_AUTH_EMULATOR_HOST: z.string().optional(),

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),

  // WebRTC STUN/TURN
  TURN_SERVER_URL: z.string().optional(),
  TURN_SHARED_SECRET: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Falha na validação das variáveis de ambiente:', parsed.error.format());
  throw new Error('Variáveis de ambiente inválidas');
}

export const env = parsed.data;
