import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  // Carrega variáveis do próprio workspace apps/mobile e da raiz do monorepo
  const localEnv = loadEnv(mode, __dirname, '');
  const rootEnv = loadEnv(mode, path.resolve(__dirname, '../..'), '');
  const rawApiUrl = process.env.VITE_API_BASE_URL || localEnv.VITE_API_BASE_URL || rootEnv.VITE_API_BASE_URL || '';
  const sanitizedApiUrl = rawApiUrl ? rawApiUrl.trim().replace(/\/+$/, '') : '';

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

  return {
    plugins: [react()],
    define: {
      ...(sanitizedApiUrl ? { 'import.meta.env.VITE_API_BASE_URL': JSON.stringify(sanitizedApiUrl) } : {}),
    },
    server: {
      port: 5174,
      host: true,
    },
  };
});

