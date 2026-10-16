import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  // Carrega variáveis do próprio workspace apps/mobile e da raiz do monorepo
  const localEnv = loadEnv(mode, __dirname, '');
  const rootEnv = loadEnv(mode, path.resolve(__dirname, '../..'), '');
  const rawApiUrl = process.env.VITE_API_BASE_URL || localEnv.VITE_API_BASE_URL || rootEnv.VITE_API_BASE_URL || '';
  const sanitizedApiUrl = rawApiUrl ? rawApiUrl.trim().replace(/\/+$/, '') : '';

  const firebaseApiKey = process.env.VITE_FIREBASE_API_KEY || localEnv.VITE_FIREBASE_API_KEY || rootEnv.VITE_FIREBASE_API_KEY || '';
  const firebaseAuthDomain = process.env.VITE_FIREBASE_AUTH_DOMAIN || localEnv.VITE_FIREBASE_AUTH_DOMAIN || rootEnv.VITE_FIREBASE_AUTH_DOMAIN || '';
  const firebaseProjectId = process.env.VITE_FIREBASE_PROJECT_ID || localEnv.VITE_FIREBASE_PROJECT_ID || rootEnv.VITE_FIREBASE_PROJECT_ID || '';
  const firebaseAppId = process.env.VITE_FIREBASE_APP_ID || localEnv.VITE_FIREBASE_APP_ID || rootEnv.VITE_FIREBASE_APP_ID || '';
  const firebaseSenderId = process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || localEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || rootEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || '';

  if (mode === 'production' && !sanitizedApiUrl) {
    console.warn('\n======================================================================');
    console.warn('⚠️  [NEXA Mobile Build Warning] VITE_API_BASE_URL não está definida!');
    console.warn('    Para conectar ao backend Render em produção, configure VITE_API_BASE_URL');
    console.warn('    no painel da Vercel (ex: https://nexa-api.onrender.com).');
    console.warn('    Em produção, a aplicação exibirá um erro de configuração amigável');
    console.warn('    em vez de tentar conectar a localhost:10000.');
    console.warn('======================================================================\n');
  } else if (sanitizedApiUrl) {
    console.log(`\n[NEXA Mobile Build] VITE_API_BASE_URL configurada: ${sanitizedApiUrl}\n`);
  }

  if (mode === 'production' && (!firebaseApiKey || !firebaseProjectId)) {
    console.warn('\n======================================================================');
    console.warn('⚠️  [NEXA Mobile Build Warning] Credenciais VITE_FIREBASE_* incompletas!');
    console.warn('    Configure VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN e');
    console.warn('    VITE_FIREBASE_PROJECT_ID no painel da Vercel para o Google Login.');
    console.warn('======================================================================\n');
  }

  return {
    plugins: [react()],
    define: {
      ...(sanitizedApiUrl ? { 'import.meta.env.VITE_API_BASE_URL': JSON.stringify(sanitizedApiUrl) } : {}),
      ...(firebaseApiKey ? { 'import.meta.env.VITE_FIREBASE_API_KEY': JSON.stringify(firebaseApiKey) } : {}),
      ...(firebaseAuthDomain ? { 'import.meta.env.VITE_FIREBASE_AUTH_DOMAIN': JSON.stringify(firebaseAuthDomain) } : {}),
      ...(firebaseProjectId ? { 'import.meta.env.VITE_FIREBASE_PROJECT_ID': JSON.stringify(firebaseProjectId) } : {}),
      ...(firebaseAppId ? { 'import.meta.env.VITE_FIREBASE_APP_ID': JSON.stringify(firebaseAppId) } : {}),
      ...(firebaseSenderId ? { 'import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID': JSON.stringify(firebaseSenderId) } : {}),
    },
    server: {
      port: 5174,
      host: true,
    },
  };
});

