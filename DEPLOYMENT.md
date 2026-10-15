# MANUAL DE DEPLOY E INFRAESTRUTURA — NEXA ECOSYSTEM

Este documento orienta a configuração de produção, publicação e manutenção contínua dos quatro serviços do ecossistema NEXA.

---

## 1. Topologia de Hospedagem

| Serviço | Plataforma | Repositório / Diretório | Domínio Sugerido |
| :--- | :--- | :--- | :--- |
| **NEXA Pay** | Vercel | `apps/pay` | `https://pay.seudominio.com` |
| **NEXA Mobile** | Vercel | `apps/mobile` | `https://mobile.seudominio.com` |
| **NEXA Chat** | Vercel | `apps/chat` | `https://chat.seudominio.com` |
| **NEXA API** | Render (Web Service) | `apps/api` | `https://api.seudominio.com` |
| **Dados & Auth** | Google Firebase | `firestore.rules` | Projeto Firebase unificado |
| **Mídias** | Cloudinary | CDN | Cloud Name dedicado |

---

## 2. Configuração do Backend no Render

1. Crie um novo **Web Service** no Render apontando para o seu repositório GitHub.
2. Defina os seguintes parâmetros na aba de configuração:
   - **Environment:** `Node`
   - **Root Directory:** `apps/api` (ou raiz com script direcionado)
   - **Build Command:** `npm install && npm run build --workspace=packages/design-tokens --workspace=packages/types --workspace=packages/validation --workspace=apps/api`
   - **Start Command:** `npm run start --workspace=apps/api`
   - **Auto-Deploy:** Ativado para a branch `main`.
3. Configure a porta: O Render define automaticamente a variável `PORT` (usualmente `10000`). O backend Fastify escuta obrigatoriamente em `0.0.0.0:${process.env.PORT || 10000}`.
4. Adicione as variáveis de ambiente secretas conforme o arquivo `.env.example`.

### 2.1 Tratamento do Cold Start no Plano Free
- O Render suspende o serviço gratuito após ~15 minutos de inatividade HTTP.
- O tempo de despertar gira em torno de 50 a 70 segundos.
- Os três frontends possuem um componente universal `ColdStartOverlay` que intercepta requisições pendentes e exibe uma tela cinematográfica sem quebrar a experiência do usuário.

---

## 3. Configuração dos Três Frontends na Vercel

Para cada frontend (`pay`, `mobile`, `chat`):
1. Importe o repositório na Vercel como **um novo projeto separado**.
2. No campo **Root Directory**, selecione a pasta correspondente:
   - Projeto 1: `apps/pay`
   - Projeto 2: `apps/mobile`
   - Projeto 3: `apps/chat`
3. **Framework Preset:** `Vite`.
4. **Build Command:** `npm run build`
5. **Output Directory:** `dist`
6. Adicione as variáveis públicas com prefixo `VITE_*` (conforme `.env.example`).

---

## 4. Configuração do Firebase e Firestore

1. No console do Firebase:
   - Ative o **Firebase Authentication** com os provedores:
     - **Google** (para NEXA Mobile e NEXA Chat).
     - **Anonymous** (para carteira demo do NEXA Pay).
   - Adicione os domínios da Vercel e domínios personalizados à lista de **Authorized Domains**.
2. No Cloud Firestore:
   - Crie a instância em modo nativo na região `southamerica-east1` (São Paulo) ou `us-central1`.
   - Aplique as regras de segurança utilizando a CLI do Firebase:
     ```bash
     firebase deploy --only firestore:rules,firestore:indexes
     ```
3. Gere uma nova **Chave Privada de Conta de Serviço** no console do Firebase e configure as variáveis `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL` e `FIREBASE_PRIVATE_KEY` no Render.

---

## 5. Configuração do Cloudinary

1. Crie uma conta no Cloudinary e obtenha o `Cloud Name`, `API Key` e `API Secret`.
2. Configure o upload não assinado como desabilitado; **todos os uploads utilizam assinaturas geradas pelo backend** (`/v1/media/upload-authorizations`).
3. No painel de segurança do Cloudinary, habilite a restrição de entrega de mídia privada com assinatura para a pasta `nexa/chat/*`.
