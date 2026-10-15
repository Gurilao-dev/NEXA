# CHECKLIST MASTER — NEXA ECOSYSTEM

Documento mestre de rastreabilidade e critérios de aceite para a implementação do ecossistema NEXA:
- **NEXA Pay** (Banco digital de demonstração com R$ 300,00 de créditos virtuais)
- **NEXA Mobile** (Operadora virtual simulada com catálogo e reserva de números)
- **NEXA Chat** (Mensageiro completo com Socket.IO, persistência Firestore, WebRTC 1:1 e mídia Cloudinary)
- **NEXA API** (Backend unificado Node.js/TypeScript, Fastify, Socket.IO, Firebase Admin, Cloudinary)

Legenda:
- `[ ]` Não iniciado
- `[>]` Em andamento
- `[x]` Concluído e verificado com testes reais
- `[!]` Bloqueado / Aguardando dependência externa

---

## Fase 0 — Engenharia do Projeto
- [x] Inspeção minuciosa de requisitos do `PROMPT_MASTER_NEXA_ECOSYSTEM.md`.
- [x] Inicialização do repositório Git com branch `main` e `.gitignore` robusto.
- [x] Configuração do monorepo (`npm workspaces`) com `apps/*` e `packages/*`.
- [x] Criação de `CHECKLIST.md` e `PROGRESSO.md`.
- [x] Criação da documentação arquitetural e de contratos:
  - [x] `ARCHITECTURE.md` (topologia, fluxo de dados, ciclo de vida de cold start Render).
  - [x] `DESIGN_SYSTEM.md` (especificação técnica Liquid Glass, tokens CSS, paletas Pay/Mobile/Chat, motion springs).
  - [x] `API_CONTRACTS.md` (contratos REST `/v1/*`, payloads Zod, eventos Socket.IO de chat e chamadas).
  - [x] `SECURITY.md` (modelo de ameaças, regras de acesso Firestore deny-by-default, idempotência, sanitização, LGPD).
  - [x] `DEPLOYMENT.md` (hospedagem Vercel + Render + Firebase + Cloudinary, variáveis e scripts).
  - [x] `.env.example` completo com documentação de cada variável pública e secreta.
  - [x] `README.md` com instruções completas de onboarding e comandos.
- [x] Criação da infraestrutura de regras e emuladores do Firebase:
  - [x] `firebase.json`
  - [x] `firestore.rules` (deny-by-default para coleções autoritativas)
  - [x] `firestore.indexes.json`
- [x] Configuração da pipeline de integração contínua (`.github/workflows/ci.yml`).
- [x] Scaffolding dos pacotes compartilhados:
  - [x] `packages/design-tokens` (tokens Liquid Glass, CSS variables, presets de cor e motion)
  - [x] `packages/types` (modelos TypeScript de domínio: Auth, Wallet, Ledger, Order, Number, Conversation, Message, Call)
  - [x] `packages/validation` (schemas Zod para validação nas fronteiras cliente e servidor)
  - [x] `packages/config` (tsconfig base e eslint)
- [x] Verificação de compilação TypeScript e scripts do monorepo.
- [x] Registro de progresso da Fase 0 no `PROGRESSO.md`.

---

## Fase 1 — Fundação Backend + Firebase
- [x] Estruturação de `apps/api` (Fastify + TypeScript + Socket.IO anexado).
- [x] Configuração do Firebase Admin SDK com inicialização segura e fallback para emulador local.
- [x] Middlewares fundamentais:
  - [x] CORS configurado exclusivamente para as origens dos 3 frontends e localhost em dev.
  - [x] Security headers (Helmet/CSP adaptada, HSTS, no-sniff, frame-ancestors).
  - [x] Rate limiting adaptativo por IP e por sessão/token.
  - [x] Autenticação Firebase ID Token (Bearer) com extração segura do `uid`.
  - [x] Validador Zod universal para requests com RFC 7807 Problem Details.
  - [x] Logger estruturado (Pino) com mascaramento de tokens e PII.
- [x] Endpoints de saúde e inicialização:
  - [x] `GET /health/live` (status do processo HTTP).
  - [x] `GET /health/ready` (validação de conexão com Firestore e dependências críticas).
  - [x] `GET /v1/public/config` (apenas parâmetros públicos do ecossistema).
- [x] Estrutura modular:
  - [x] Módulo `auth` (verificação de tokens e emissão de sessões anônimas/visitante).
  - [x] Módulo `wallets` (regras e transações atômicas de carteira demo).
  - [x] Módulo `numbers` (estoque e geração de números virtuais).
  - [x] Módulo `orders` (ciclo de checkout e idempotência).
- [x] Testes de integração da API contra Firestore Emulator.
- [x] Script de deploy / manifesto Render (`render.yaml`).

---

## Fase 2 — Design System Liquid Glass
- [x] Criação do pacote `packages/ui` compartilhado com componentes React + Tailwind CSS:
  - [x] `GlassSurface` (backdrop blur com saturação, borda óptica assimétrica, caustic specular).
  - [x] `GlassButton` (feedback tátil spring, estado disabled, loading spinner glass).
  - [x] `GlassCard` (variante com contraste otimizado para leitura, sem saturação excessiva).
  - [x] `GlassModal` / `GlassDialog` (foco acessível, dismiss por Escape e clique no overlay).
  - [x] `GlassNav` / `GlassDock` (barra flutuante com indicador elástico de seleção).
  - [x] `GlassInput` / `GlassSearch` (estados foco, erro, máscara e acessibilidade de formulário).
  - [x] `GlassToast` (notificações in-app acessíveis com `aria-live`).
  - [x] `GlassTooltip` / `GlassPopover` (posicionamento dinâmico sem clipping).
  - [x] `ColdStartOverlay` (tela full-screen para despertar do Render com animação líquida e retry backoff).
- [x] Suporte a temas Claro, Escuro e Sistema com transições suaves.
- [x] Modos de acessibilidade: `prefers-reduced-motion` e `prefers-reduced-transparency`.
- [x] Verificação de contraste WCAG AA em todas as superfícies com texto.
- [x] Testes unitários com Vitest e React Testing Library para componentes do design system.

---

## Fase 3 — NEXA Pay Completo (Site 1)
- [ ] Configuração do app `apps/pay` com Vite, React, TypeScript e Tailwind CSS.
- [ ] Identidade visual: base Dark Navy / Azul Glacial profundo, números tipográficos com peso premium.
- [ ] Aviso explícito persistente e indelével: "AMBIENTE DE SIMULAÇÃO — NÃO É DINHEIRO REAL".
- [ ] Integração com Firebase Anonymous Auth para criação de sessão visitante única.
- [ ] Backend Ledger seguro:
  - [ ] Concessão única de R$ 300,00 (30.000 centavos) por carteira no servidor.
  - [ ] Prevenção de re-concessão abusiva.
  - [ ] Transações atômicas no Firestore com registro imutável em `walletLedger`.
  - [ ] Idempotência rigorosa com `walletOperations`.
- [ ] Telas e funcionalidades:
  - [ ] Dashboard com saldo, botão ocultar/exibir, cartões de ação rápida.
  - [ ] Onboarding educativo sobre a natureza temporária e descartável da carteira.
  - [ ] Pix simulado interno (envio entre chaves NEXA com validação do recebedor pelo backend).
  - [ ] Recebimento Pix simulado com QR code interno NEXA (sem payload BR Code bancário).
  - [ ] Extrato paginado com filtros (entradas/saídas, data, busca) e agrupamento por dia.
  - [ ] Detalhe de transação e Comprovante visualmente elegante com carimbo "SIMULADO".
  - [ ] Tela de confirmação de Checkout mediado por ticket temporário.
- [ ] Tratamento de erros de UX: saldo insuficiente, transação duplicada, offline, ticket expirado.
- [ ] Testes de concorrência e idempotência contra o backend.

---

## Fase 4 — NEXA Mobile Funcional (Site 2)
- [ ] Configuração do app `apps/mobile` com Vite, React, TypeScript e Tailwind CSS.
- [ ] Autenticação Firebase com Google OAuth (persistência de sessão, logout).
- [ ] Perfil de usuário: criação idempotente do documento `users/{uid}` via backend.
- [ ] Catálogo de números virtuais:
  - [ ] Formato brasileiro fictício `+55 (DD) 9XXXX-XXXX` exclusivo do ecossistema.
  - [ ] Sinalização clara e repetida: "Número NEXA exclusivo para o ecossistema — não recebe chamadas/SMS da rede pública".
  - [ ] Filtros por DDD, padrões visuais, preço e paginação real no Firestore.
  - [ ] Detalhes do número e botão de reserva com TTL server-side.
- [ ] Fluxo de Checkout e Integração com NEXA Pay:
  - [ ] Criação de pedido autenticado no backend (`POST /v1/mobile/orders`).
  - [ ] Emissão de ticket temporário e redirecionamento seguro para NEXA Pay.
  - [ ] Liquidação atômica e provisionamento do número para o `ownerUid`.
  - [ ] Retorno à NEXA Mobile com polling/verificação ativa do status do pedido no servidor.
- [ ] Área logada:
  - [ ] Dashboard com número principal e atalho para abrir NEXA Chat.
  - [ ] Tela "Meus Números" com listagem, escolha de número principal e histórico de pedidos.
  - [ ] Gestão de perfil, preferências de notificações e exclusão de dados (LGPD).
- [ ] Testes E2E do ciclo de compra de número entre Mobile e Pay.

---

## Fase 5 — Landing Cinematográfica da NEXA Mobile
- [ ] Desenvolvimento de 8 a 12 seções narrativas contínuas:
  - [ ] Preloader vetorial NEXA com animação líquida suave.
  - [ ] Header flutuante glass com condensação no scroll e menu responsivo.
  - [ ] Hero cinematográfico com mockup 3D original e iluminação volumétrica.
  - [ ] Scroll-cinema A: montagem visual e nascimento do cartão de número virtual sincronizado ao scroll.
  - [ ] Grade de benefícios com cartões de refração e microinterações.
  - [ ] Scroll-cinema B: transformação do chip virtual em interface de chat fluida.
  - [ ] Linha do tempo interativa "Como Funciona".
  - [ ] Vitrine dinâmica de números virtuais consultando API em tempo real.
  - [ ] Demonstração interativa lado a lado da carteira NEXA Pay.
  - [ ] Tabela transparente de preços e aviso de créditos fictícios.
  - [ ] FAQ completo sobre limitações, segurança e funcionalidades.
  - [ ] CTA final imersivo e footer com links de privacidade e termos.
- [ ] Controle de performance: orçamento de bytes, lazy loading de frames, suporte a `prefers-reduced-motion`.
- [ ] Testes de responsividade mobile (360px, 390px, 430px) e desktop widescreen.

---

## Fase 6 — NEXA Chat MVP Persistente (Site 3)
- [ ] Configuração do app `apps/chat` com Vite, React, TypeScript e Tailwind CSS.
- [ ] Validação rigorosa de acesso:
  - [ ] Entrada de número NEXA com verificação de posse (`ownerUid == auth.uid`) pelo backend.
  - [ ] Seletor de número próprio para usuários com múltiplas linhas ativas.
  - [ ] Deep-link para NEXA Mobile se o usuário não possuir número virtual.
  - [ ] Criação de perfil no chat (`displayName`, `avatar`, `about`, privacidade).
- [ ] Conexão Socket.IO com handshake autenticado por Firebase ID Token.
- [ ] Persistência de Mensageria:
  - [ ] Caminho autoritativo único no backend com escrita atômica no Firestore antes de emitir ACK.
  - [ ] Reconexão e recuperação de mensagens por cursor cronológico.
  - [ ] Optimistic UI com rollback e `clientMessageId` para deduplicação.
  - [ ] Confirmação de entrega e leitura (`sent`, `delivered`, `read`).
  - [ ] Indicadores efêmeros de digitação (`typing`) com TTL via Socket.IO.
- [ ] Layout adaptativo:
  - [ ] Mobile: lista de conversas, bottom dock glass, tela de chat em tela cheia com composer fixo.
  - [ ] Desktop: duas colunas com lista de conversas e painel de chat ativo, busca e atalhos.
- [ ] Teste de troca de mensagens em tempo real entre dois navegadores distintos.

---

## Fase 7 — NEXA Chat Avançado
- [ ] Grupos de conversa:
  - [ ] Criação de grupos com foto, título e descrição.
  - [ ] Gestão de papéis (`owner`, `admin`, `member`) no backend.
  - [ ] Links de convite revogáveis com tokens seguros.
  - [ ] Mensagens de sistema para entradas, saídas e alterações de grupo.
- [ ] Recursos avançados de mensagens:
  - [ ] Respostas citando mensagem original.
  - [ ] Reações com emojis.
  - [ ] Edição de mensagens dentro de janela de tempo permitida com selo "editada".
  - [ ] Exclusão de mensagens ("para mim" e "para todos") com tombstone auditável.
  - [ ] Fixar e favoritar mensagens.
- [ ] Mídia segura via Cloudinary:
  - [ ] Upload com assinatura criptográfica gerada exclusivamente pelo backend.
  - [ ] Envio e visualização fullscreen de fotos com EXIF corrigido.
  - [ ] Upload e player de vídeo adaptativo com controle de tempo e tamanho.
  - [ ] Gravação e reprodução de mensagens de voz via MediaRecorder com forma de onda e velocidades (1x, 1.5x, 2x).
  - [ ] Compartilhamento de arquivos PDF/documentos com verificação de MIME seguro.
  - [ ] URLs protegidas para mídia privada sem vazamento público.
- [ ] Gestão de contatos: adição por número NEXA, apelido privado e controle de bloqueio.
- [ ] Painel de configurações completas (privacidade, aparência, armazenamento, notificações).

---

## Fase 8 — Chamadas de Voz e Vídeo WebRTC
- [ ] Sinalização WebRTC 1:1 via Socket.IO com autenticação estrita de participantes.
- [ ] Gestão de permissões de microfone e câmera com UX explicativa e preview.
- [ ] Fluxo de chamada:
  - [ ] Convite e ringing com timeout automático.
  - [ ] Aceite, rejeição e cancelamento.
  - [ ] Troca de `offer`, `answer` e `iceCandidate` em sala efêmera protegida.
  - [ ] Integração com servidores STUN públicos e suporte a TURN temporário configurável.
- [ ] Interface de chamada cinematográfica em tela cheia:
  - [ ] Gradientes dinâmicos e avatar animado em chamadas de voz.
  - [ ] Vídeo bidirecional responsivo com troca de câmera (mobile) e fullscreen.
  - [ ] Controles flutuantes glass (mute mic, desligar câmera, encerrar, trocar dispositivo).
  - [ ] Indicador de qualidade de conexão e duração da chamada.
- [ ] Histórico de chamadas salvo no Firestore (sem gravação de mídia de áudio/vídeo).
- [ ] Testes de conexão WebRTC entre duas instâncias com simulação de encerramento e reconexão.

---

## Fase 9 — Notificações, Polimento e Acessibilidade
- [ ] Implementação do componente universal de Cold Start (`ColdStartOverlay`) nos 3 frontends com detecção de latência do Render.
- [ ] Toasts e notificações sonoras discretas com respeito a autoplay do navegador.
- [ ] Configuração de Service Worker para Web Push com FCM (onde suportado e com consentimento).
- [ ] Auditoria de acessibilidade:
  - [ ] Foco visível em todos os elementos interativos.
  - [ ] Navegação completa por teclado.
  - [ ] Atributos ARIA adequados e anúncios de tela (`aria-live`).
  - [ ] Suporte a zoom de até 200% sem perda de funcionalidade ou quebra de layout.
  - [ ] Teste em modo `prefers-reduced-motion` e `prefers-contrast: more`.
- [ ] Medição de Web Vitals (LCP, CLS, INP) em conexões simuladas mobile.

---

## Fase 10 — Deploy, Infraestrutura e Auditoria Final
- [ ] Deploy do backend (`apps/api`) no Render Web Service com monitoramento e logs estruturados.
- [ ] Deploy dos três frontends no Vercel com três domínios/projetos distintos:
  - [ ] `apps/pay`
  - [ ] `apps/mobile`
  - [ ] `apps/chat`
- [ ] Configuração das variáveis de ambiente de produção sem exposição de segredos.
- [ ] Deploy e validação das regras do Firestore (`firestore.rules`) e índices compostos.
- [ ] Teste do ciclo completo de ponta a ponta (E2E) em produção:
  - [ ] Acesso ao Pay e verificação do saldo de R$ 300,00.
  - [ ] Acesso à Mobile com login Google, reserva e compra de número.
  - [ ] Pagamento pelo Pay e confirmação atômica.
  - [ ] Entrada no Chat com o número adquirido, troca de mensagens em tempo real e chamada de teste.
- [ ] Auditoria final de segurança (ausência de dados de API real de banco, termos claros de simulação, ausência de vazamento de chaves privadas).
- [ ] Entrega da documentação final de operação e manutenção.
