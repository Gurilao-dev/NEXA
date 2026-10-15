# NEXA Ecosystem

> **Ambiente Integrado de Demonstração Tecnológica de Alta Fidelidade**  
> Três aplicações web de design premium alimentadas por uma API central em tempo real, ilustrando o ciclo de vida completo entre carteira digital de demonstração, operadora virtual e mensageiro instantâneo com WebRTC.

---

## ⚠️ Aviso de Simulação e Veracidade

1. **NEXA Pay:** Banco **100% fictício de demonstração**. Todo novo visitante recebe automaticamente R$ 300,00 de créditos simulados para experimentar a plataforma. Nenhum valor monetário real é movimentado, custodiado ou cobrado. As transferências e recibos não possuem valor fiscal ou bancário.
2. **NEXA Mobile:** Operadora **virtual simulada**. Os números no formato brasileiro (`+55 (DD) 9XXXX-XXXX`) são identificadores virtuais exclusivos do ecossistema e não recebem SMS nem chamadas da rede de telefonia pública.
3. **NEXA Chat:** Mensageiro instantâneo WebRTC e Socket.IO. A autenticação associa a conta Google do usuário ao número virtual adquirido na NEXA Mobile.

---

## 🏛️ Estrutura do Monorepo

O projeto está estruturado em monorepo com `npm workspaces`:

```text
nexa-ecosystem/
├── apps/
│   ├── pay/                  # NEXA Pay: Banco digital simulado (Vite + React)
│   ├── mobile/               # NEXA Mobile: Vitrine cinematográfica e catálogo (Vite + React)
│   ├── chat/                 # NEXA Chat: Mensageiro em tempo real e WebRTC (Vite + React)
│   └── api/                  # NEXA API: Fastify + Socket.IO + Firebase Admin
├── packages/
│   ├── design-tokens/        # Tokens Liquid Glass e temas (Pay, Mobile, Chat)
│   ├── ui/                   # Componentes React compartilhados com estética Glass
│   ├── types/                # Definições de tipos TypeScript estritos
│   ├── validation/           # Schemas de validação Zod compartilhados
│   ├── sdk/                  # Cliente API tipado e Socket.IO com retry
│   ├── firebase-client/      # Configuração modular do Firebase Client
│   ├── utils/                # Formatadores BRL, máscaras e helpers
│   └── config/               # Configurações TypeScript e ESLint compartilhadas
├── firestore.rules           # Regras de segurança Cloud Firestore (Deny-by-Default)
├── firestore.indexes.json    # Índices compostos do Firestore
├── firebase.json             # Configuração para Firebase Emulator Suite
├── CHECKLIST.md              # Rastreamento de requisitos e critérios de aceite
├── PROGRESSO.md              # Diário de bordo e histórico de execuções
└── ARCHITECTURE.md           # Especificação arquitetural do sistema
```

---

## 🚀 Como Executar Localmente

### Pré-requisitos
- **Node.js:** Versão 20 ou superior (Recomendado: Node v24 LTS).
- **npm:** Versão 10 ou superior.

### 1. Clonar e Instalar Dependências
```bash
git clone <URL_DO_REPOSITORIO>
cd NEXA
npm install
```

### 2. Configurar Variáveis de Ambiente
Copie o template de variáveis de ambiente:
```bash
cp .env.example .env
```
*(Consulte `DEPLOYMENT.md` para instruções completas de configuração do Firebase e Cloudinary).*

### 3. Iniciar o Ambiente de Desenvolvimento
Para rodar todos os serviços simultaneamente:
```bash
npm run dev
```

Ou execute serviços individualmente:
- **API Backend:** `npm run dev --workspace=apps/api` (Disponível em `http://localhost:10000`)
- **NEXA Pay:** `npm run dev --workspace=apps/pay` (Disponível em `http://localhost:5173`)
- **NEXA Mobile:** `npm run dev --workspace=apps/mobile` (Disponível em `http://localhost:5174`)
- **NEXA Chat:** `npm run dev --workspace=apps/chat` (Disponível em `http://localhost:5175`)

---

## 📚 Documentação Técnica Adicional

- [ARCHITECTURE.md](file:///./ARCHITECTURE.md) — Topologia, fluxo de dados e ciclo de vida do cold start.
- [DESIGN_SYSTEM.md](file:///./DESIGN_SYSTEM.md) — Especificação técnica do Liquid Glass, tokens e acessibilidade.
- [API_CONTRACTS.md](file:///./API_CONTRACTS.md) — Endpoints REST, RFC 7807 e eventos Socket.IO.
- [SECURITY.md](file:///./SECURITY.md) — Modelo de ameaças, regras do Firestore e conformidade LGPD.
- [DEPLOYMENT.md](file:///./DEPLOYMENT.md) — Guia de publicação na Vercel e Render.
- [CHECKLIST.md](file:///./CHECKLIST.md) — Status completo de implementação das Fases 0 a 10.
- [PROGRESSO.md](file:///./PROGRESSO.md) — Registro oficial de commits, testes e evidências.
