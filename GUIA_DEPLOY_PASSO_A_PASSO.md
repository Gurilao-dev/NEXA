# GUIA COMPLETO PASSO A PASSO — NEXA ECOSYSTEM
### Como Configurar Firebase, Cloudinary, Render e Vercel (Do Zero à Produção)

Este guia foi elaborado de forma simples, direta e prática para você colocar todo o ecossistema NEXA no ar sem complicação.

---

## 🗺️ 1. O Mapa do Ecossistema (Como tudo se conecta)

O projeto é dividido em **4 serviços principais**:

```
                  ┌──────────────────────┐
                  │      NEXA API        │
                  │   (Render - Backend) │
                  └──────────┬───────────┘
                             │
     ┌───────────────────────┼───────────────────────┐
     ▼                       ▼                       ▼
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│   NEXA Pay   │      │ NEXA Mobile  │      │  NEXA Chat   │
│   (Vercel)   │      │   (Vercel)   │      │   (Vercel)   │
│   Porta 5173 │      │  Porta 5174  │      │  Porta 5175  │
└──────────────┘      └──────────────┘      └──────────────┘
```

1. **NEXA API (Backend no Render):** O cérebro do sistema. Gerencia os saldos de R$ 300,00, as compras de números virtuais, os sockets em tempo real e a persistência no banco.
2. **NEXA Pay (Frontend na Vercel):** O banco digital simulado onde o visitante ganha R$ 300,00 e paga as linhas.
3. **NEXA Mobile (Frontend na Vercel):** A operadora virtual com a landing page cinematográfica 3D e catálogo de números.
4. **NEXA Chat (Frontend na Vercel):** O mensageiro criptografado com chamadas WebRTC P2P que só abre para quem tem número ativo.
5. **Firebase:** O banco de dados (Firestore) e login (Google / Anônimo).
6. **Cloudinary:** Armazena as fotos e mídias do chat com segurança.

---

## 🔥 2. Passo a Passo do Firebase (Autenticação + Banco de Dados)

### Passo 2.1 — Criar o Projeto
1. Acesse o [Console do Firebase](https://console.firebase.google.com/) com sua conta Google.
2. Clique em **"Adicionar projeto"** (ou "Criar projeto").
3. Digite o nome: `nexa-ecosystem` (ou outro nome de sua preferência).
4. O Google Analytics é opcional (pode desmarcar para ser mais rápido).
5. Clique em **"Criar projeto"** e aguarde alguns segundos.

---

### Passo 2.2 — Ativar o Firebase Authentication (Login)
1. No menu lateral esquerdo, clique em **Criação** (Build) ➔ **Authentication**.
2. Clique no botão **"Primeiros passos"**.
3. Na aba **Provedores de login** (Sign-in method):
   - **Provedor 1: Google**
     - Clique em **Google**, ative a chavinha **Ativar**.
     - Escolha o seu e-mail de suporte e clique em **Salvar**.
   - **Provedor 2: Anônimo**
     - Clique em **Adicionar novo provedor**.
     - Selecione **Anônimo**, ative a chavinha e clique em **Salvar**.
     *(Isso é necessário para que qualquer visitante ganhe a carteira demo de R$ 300,00 na NEXA Pay sem precisar criar conta!)*

---

### Passo 2.3 — Criar o Banco Firestore
1. No menu lateral esquerdo, clique em **Criação** ➔ **Firestore Database**.
2. Clique no botão **"Criar banco de dados"**.
3. Local do banco: selecione `southamerica-east1` (São Paulo) ou `us-central1`.
4. Modo de segurança: selecione **Modo de produção** (Production mode) e clique em **Criar**.

---

### Passo 2.4 — Pegar a Chave do Servidor (Para o Backend no Render)
O backend usa o **Firebase Admin SDK** para ter controle seguro sobre as transações.
1. No topo do menu esquerdo, clique na **engrenagem** ao lado de "Visão geral do projeto" ➔ **Configurações do projeto**.
2. Vá até a aba **Contas de serviço** (Service accounts).
3. Selecione o botão de opção **Node.js**.
4. Clique no botão **"Gerar nova chave privada"** e confirme em **"Gerar chave"**.
5. Um arquivo `.json` será baixado no seu computador. Abra ele com o Bloco de Notas ou VS Code.
6. Você vai precisar de três valores desse arquivo:
   - `project_id` (ex: `nexa-ecosystem-12345`)
   - `client_email` (ex: `firebase-adminsdk-xxx@nexa-ecosystem.iam.gserviceaccount.com`)
   - `private_key` (um texto longo que começa com `-----BEGIN PRIVATE KEY-----\n...`)

---

### Passo 2.5 — Pegar as Chaves do Cliente (Para os Frontends)
1. Ainda em **Configurações do projeto**, desça a página até a seção **Seus aplicativos**.
2. Clique no ícone da Web `</>`.
3. Apelido do app: digite `nexa-web` e clique em **Registrar app**.
4. O Firebase vai te mostrar um objeto `firebaseConfig` com:
   - `apiKey`
   - `authDomain`
   - `projectId`
   - `storageBucket`
   - `messagingSenderId`
   - `appId`
5. Guarde esses valores! Eles serão usados nas variáveis de ambiente dos frontends.

---

### Passo 2.6 — Aplicar as Regras de Segurança
O projeto já vem com as regras prontas no arquivo `firestore.rules`.
Você pode aplicá-las direto no Console do Firebase:
1. No Firebase Console, vá em **Firestore Database** ➔ aba **Regras** (Rules).
2. Apague o que estiver lá e cole todo o conteúdo do arquivo `firestore.rules` do projeto.
3. Clique em **Publicar** (Publish).

---

## ☁️ 3. Passo a Passo do Cloudinary (Fotos e Mídias)

O Cloudinary é usado para armazenar com segurança fotos de perfil, comprovantes e fotos enviadas no chat.

1. Acesse [Cloudinary](https://cloudinary.com/) e crie uma conta gratuita (botão **Sign Up for Free**).
2. Após fazer login, você cairá no **Dashboard** (Painel de Controle).
3. Logo no topo da página inicial, no bloco **Product Environment Credentials**, você verá:
   - **Cloud Name** (ex: `dxyzk1234`)
   - **API Key** (ex: `123456789012345`)
   - **API Secret** (clique no ícone do olho para copiar o código secreto)
4. Guarde esses 3 valores. Eles irão exclusivamente para o Backend no Render!
   *(O frontend nunca recebe a API Secret por segurança. O backend assina cada upload via HMAC).*

---

## 🚀 4. Passo a Passo do Render (Hospedando o Backend)

O backend Fastify + Socket.IO fica no Render Web Service.

### Passo 4.1 — Criar o Web Service
1. Acesse [Render.com](https://render.com/) e crie sua conta (pode entrar com o GitHub).
2. Clique no botão **New +** no topo ➔ selecione **Web Service**.
3. Selecione a opção **"Build and deploy from a Git repository"** e clique em **Next**.
4. Conecte sua conta do GitHub e selecione o repositório **`dev-gurila/NEXA`**.
5. Preencha as configurações básicas:
   - **Name:** `nexa-api`
   - **Region:** `Ohio (US East)` ou `Frankfurt`
   - **Branch:** `main`
   - **Root Directory:** deixe **em branco** (o comando usará os workspaces da raiz).
   - **Runtime:** `Node`
   - **Build Command:**
     ```bash
     npm install && npm run build --workspace=@nexa/design-tokens --workspace=@nexa/types --workspace=@nexa/validation --workspace=@nexa/api
     ```
   - **Start Command:**
     ```bash
     npm run start --workspace=@nexa/api
     ```
   - **Instance Type:** `Free`

---

### Passo 4.2 — Inserir as Variáveis de Ambiente no Render
Na mesma página (ou na aba **Environment** após criar), adicione as seguintes variáveis:

| Chave (Key) | Valor (Value) | Origem |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Padrão |
| `PORT` | `10000` | Render |
| `FRONTEND_PAY_ORIGIN` | `https://nexa-pay.vercel.app` | URL que a Vercel vai gerar |
| `FRONTEND_MOBILE_ORIGIN` | `https://nexa-mobile.vercel.app` | URL que a Vercel vai gerar |
| `FRONTEND_CHAT_ORIGIN` | `https://nexa-chat.vercel.app` | URL que a Vercel vai gerar |
| `FIREBASE_PROJECT_ID` | Seu `project_id` do Firebase | Arquivo JSON do Firebase |
| `FIREBASE_CLIENT_EMAIL` | Seu `client_email` do Firebase | Arquivo JSON do Firebase |
| `FIREBASE_PRIVATE_KEY` | Sua `private_key` do Firebase | Arquivo JSON do Firebase *(incluindo os `-----BEGIN...` e `-----END...`)* |
| `CLOUDINARY_CLOUD_NAME` | Seu Cloud Name do Cloudinary | Painel Cloudinary |
| `CLOUDINARY_API_KEY` | Sua API Key do Cloudinary | Painel Cloudinary |
| `CLOUDINARY_API_SECRET` | Sua API Secret do Cloudinary | Painel Cloudinary |

> **Dica sobre o Cold Start no Plano Free:**
> O Render suspende o serviço gratuito após 15 minutos sem uso. Quando alguém entra, leva cerca de 50 segundos para despertar.
> Os 3 frontends já foram programados com a tela **`ColdStartOverlay`**, que avisa o usuário de forma elegante com animação e reconecta automaticamente assim que o servidor acorda!

6. Clique em **Create Web Service**.
7. Quando o build finalizar, o Render vai te dar a URL pública do seu backend (ex: `https://nexa-api.onrender.com`). Guarde essa URL!

---

## 🌐 5. Passo a Passo da Vercel (Hospedando os 3 Frontends)

Na Vercel, você vai importar o **mesmo repositório 3 vezes**, uma para cada aplicativo!

### Passo 5.1 — Publicar o NEXA Pay (Site 1)
1. Acesse [Vercel.com](https://vercel.com/) e entre com seu GitHub.
2. Clique em **Add New...** ➔ **Project**.
3. Escolha o repositório `dev-gurila/NEXA`.
4. Em **Project Name**, coloque: `nexa-pay`.
5. Em **Root Directory**, clique em **Edit** e selecione a pasta: `apps/pay`.
6. Em **Framework Preset**, selecione **Vite**.
7. Abra a sanfona **Environment Variables** e adicione:
   - `VITE_API_BASE_URL` = `https://nexa-api.onrender.com` (a URL da sua API no Render)
   - `VITE_FIREBASE_API_KEY` = Sua chave pública do Firebase
   - `VITE_FIREBASE_AUTH_DOMAIN` = Seu domínio de auth do Firebase
   - `VITE_FIREBASE_PROJECT_ID` = Seu ID do projeto Firebase
8. Clique em **Deploy**.

---

### Passo 5.2 — Publicar a NEXA Mobile (Site 2)
1. Na Vercel, clique novamente em **Add New...** ➔ **Project**.
2. Escolha o mesmo repositório `dev-gurila/NEXA`.
3. Em **Project Name**, coloque: `nexa-mobile`.
4. Em **Root Directory**, selecione: `apps/mobile`.
5. Em **Framework Preset**, selecione **Vite**.
6. Em **Environment Variables**, adicione:
   - `VITE_API_BASE_URL` = `https://nexa-api.onrender.com`
   - `VITE_PAY_URL` = `https://nexa-pay.vercel.app` (a URL gerada no passo anterior)
   - `VITE_CHAT_URL` = `https://nexa-chat.vercel.app`
   - `VITE_FIREBASE_API_KEY` = Sua chave pública do Firebase
   - `VITE_FIREBASE_AUTH_DOMAIN` = Seu domínio de auth do Firebase
   - `VITE_FIREBASE_PROJECT_ID` = Seu ID do projeto Firebase
7. Clique em **Deploy**.

---

### Passo 5.3 — Publicar o NEXA Chat (Site 3)
1. Na Vercel, clique novamente em **Add New...** ➔ **Project**.
2. Escolha o repositório `dev-gurila/NEXA`.
3. Em **Project Name**, coloque: `nexa-chat`.
4. Em **Root Directory**, selecione: `apps/chat`.
5. Em **Framework Preset**, selecione **Vite**.
6. Em **Environment Variables**, adicione:
   - `VITE_API_BASE_URL` = `https://nexa-api.onrender.com`
   - `VITE_MOBILE_URL` = `https://nexa-mobile.vercel.app`
   - `VITE_FIREBASE_API_KEY` = Sua chave pública do Firebase
   - `VITE_FIREBASE_AUTH_DOMAIN` = Seu domínio de auth do Firebase
   - `VITE_FIREBASE_PROJECT_ID` = Seu ID do projeto Firebase
7. Clique em **Deploy**.

---

## 🎯 6. Passo a Passo do Teste de Ponta a Ponta (E2E)

Depois de publicar, faça este teste rápido para ver a mágica do ecossistema funcionando:

1. **Abra o NEXA Pay:** Veja seu saldo de R$ 300,00 concedido automaticamente e o aviso de simulação.
2. **Abra a NEXA Mobile:** Role a landing page cinematográfica 3D, faça login com Google e vá ao Catálogo de Números.
3. **Compre um Número Virtual:** Escolha um número (ex: `+55 (11) 99876-5432`) e clique em "Adquirir".
4. **Pague no NEXA Pay:** Você será redirecionado para a tela de checkout do NEXA Pay com o ticket seguro. Clique em "Confirmar Pagamento Simulado".
5. **Veja a Posse:** O pagamento é liquidado no banco, o saldo cai no extrato com comprovante "SIMULADO" e o número é atribuído à sua conta na Mobile.
6. **Entre no NEXA Chat:** Abra o NEXA Chat. O sistema reconhece sua nova linha, ativa o perfil e abre a rede para envio de mensagens em tempo real e chamadas de vídeo WebRTC!

---

## 🔒 7. Dúvidas Frequentes

- **Preciso pagar alguma coisa?** Não! Todos os serviços utilizados possuem tiers gratuitos que cobrem 100% da operação de demonstração (Firebase Spark, Cloudinary Free, Render Free e Vercel Hobby).
- **O que acontece se eu não configurar o Firebase agora?** O backend possui um **adaptador local transacional em memória**. Se as variáveis do Firebase não forem informadas, o sistema funciona normalmente em modo local para testes autônomos!
- **Como atualizar o código depois?** Toda vez que você fizer um `git push` para o GitHub, o Render e a Vercel atualizam seus sites automaticamente em menos de 2 minutos.
