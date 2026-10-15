# PROMPT MESTRE — NEXA ECOSYSTEM

**Destino:** agente de desenvolvimento autônomo no Antigravity / Claude Code.  
**Idioma do projeto:** português brasileiro (pt-BR).  
**Objetivo:** implementar três websites totalmente funcionais e integrados, com design premium e infraestrutura preparada para GitHub + Vercel + Render + Firebase + Cloudinary.  
**Estado:** especificação técnica executável; não trate este arquivo como uma simples descrição visual.

---

## 0. COMANDO AO AGENTE — LEIA ANTES DE CODIFICAR

Você atuará como arquiteto de software, engenheiro full-stack sênior, especialista em segurança de aplicações, designer de produto digital e engenheiro de experiência interativa. Construa **um produto funcional**, não um protótipo estático, não uma coleção de páginas que parecem funcionar e não um frontend desconectado de um backend fictício.

1. Leia este documento **integralmente** e mantenha todas as decisões arquiteturais coerentes entre os três sites.
2. Examine o repositório antes de criar arquivos; **preserve** código útil existente e documente decisões de mudança.
3. Investigue as **skills/plugins de frontend, UI, animação, acessibilidade, segurança e testes já instalados** no ambiente e use os pertinentes conforme suas instruções. Não invente skills ou ferramentas indisponíveis.
4. Crie `ARCHITECTURE.md`, `DESIGN_SYSTEM.md`, `API_CONTRACTS.md`, `SECURITY.md`, `DEPLOYMENT.md`, `CHECKLIST.md`, `PROGRESSO.md`, `.env.example` e `README.md`.
5. Divida em fases pequenas com critérios de aceite e conclua uma fase de cada vez: faça implementação, testes e atualização de progresso; **não tente escrever todo o produto num único passo**.
6. Toda funcionalidade na interface precisa ter lógica real, validação, estados de carregamento, estados vazios, erros e testes. Proibido deixar botões decorativos, números hardcoded em telas finais ou dados de usuário aleatórios disfarçados de backend.
7. Onde faltarem credenciais, implemente adaptadores e modo de desenvolvimento controlado, explicando exatamente o que falta; **não finja integração concluída**.
8. Se houver contradições entre estética e segurança/legibilidade/desempenho, priorize a experiência segura, acessível e utilizável.
9. Não exponha tokens, credenciais de servidor, secrets ou chaves privadas no frontend, GitHub ou logs.
10. Não invente funções e ofertas de fornecedores; valide a compatibilidade das APIs e dependências na documentação atual antes de programar.
11. Ao final de cada etapa: executar lint, testes pertinentes, build, corrigir falhas, preencher checklist e registrar em `PROGRESSO.md` o que está implementado, o que não está e instruções para testar.
12. Se a tarefa atual for grande demais para concluir com confiabilidade, pare em limite de fase **funcional** e indique a próxima ação, sem omitir requisitos.

## 1. VISÃO DO PRODUTO

Nome de trabalho: **NEXA Ecosystem**. Três produtos com design original, assinatura visual comum e propósitos distintos:

- **NEXA Pay:** banco **fictício de demonstração** sem cadastro obrigatório, com carteira de R$ 300,00 de créditos virtuais, Pix simulado, extrato e comprovantes fictícios.
- **NEXA Mobile:** vitrine e central de uma **operadora virtual simulada**, com autenticação Google, compra de números exclusivamente internos ao ecossistema, cobrança por NEXA Pay, propriedade persistente das linhas, gerenciamento e integração com chat.
- **NEXA Chat:** mensageiro com identidade associada à conta Google da NEXA Mobile e a um número virtual comprado, conversas, grupos, mensagens em tempo real, compartilhamento de mídia, áudios, chamadas WebRTC, notificações e preferências detalhadas.

**Regra de veracidade:** nenhum saldo possui valor monetário real; nenhum Pix é enviado pelo SPI ou rede bancária; nenhum número é uma linha telefônica real, recebe SMS de operadoras ou funciona no sistema telefônico público. Exibir a distinção com clareza. O nome é provisório; usar identidade autoral sem copiar logos da Apple, da Vivo ou de bancos existentes.

### 1.1 História central do usuário

1. Pessoa abre NEXA Mobile e conhece o serviço por uma landing page cinematográfica.
2. Cria conta ou entra usando Google pelo Firebase Authentication.
3. Seleciona um número virtual livre em um catálogo com preço configurável.
4. Inicia checkout de pagamento simulado, que abre NEXA Pay com um pedido temporário assinado/controlado pelo backend.
5. Em NEXA Pay, entra **como visitante** automaticamente em uma carteira pessoal de demonstração criada no backend com saldo inicial de R$ 300,00 em crédito fictício.
6. Confere nome do recebedor, número virtual que deseja comprar, valor do pedido e confirmação explícita de que é uma simulação.
7. Autoriza pagamento e recebe comprovante; backend debita de modo atômico, registra ledger e liquida o pedido sem permitir débito duplicado.
8. Retorna à operadora. O backend verifica o status da compra **por conta própria**, não confia na URL de retorno, e vincula permanentemente o número ao `uid` do usuário autenticado.
9. A partir da NEXA Mobile, a pessoa pode abrir NEXA Chat. Autentica-se pelo mesmo provedor Google, informa ou seleciona um número virtual **que o backend prova ser dela**, configura nome, foto, bio e preferências.
10. Adiciona contatos pelo número NEXA, conversa com pessoas reais conectadas ao aplicativo, envia mídias, faz chamadas de voz/vídeo e acessa as conversas ao entrar novamente.

**Importante sobre o visitante:** a carteira é anônima para o usuário, mas possui **identidade de sessão anônima** no Firebase Auth ou credencial de visitante emitida pelo servidor; não é um saldo global compartilhado por qualquer pessoa. O valor de R$ 300 é concedido **uma única vez por carteira de demonstração**, com barreiras razoáveis contra duplicação e abuso. Por não exigir conta persistente, a carteira pode ser perdida caso o navegador apague seus dados; explicar isso na UI. **Não vincular automaticamente o saldo do banco ao login Google**: o pagamento pontual se associa ao pedido autenticado da operadora via backend seguro.

## 2. ARQUITETURA E TECNOLOGIAS OBRIGATÓRIAS

### 2.1 Plataforma e hospedagem

- **Repositório:** GitHub com monorepo usando `npm workspaces` ou `pnpm workspaces`, lockfile versionado e scripts replicáveis.
- **Frontends:** três aplicações React + TypeScript + Vite hospedadas como **três projetos Vercel** separados, cada qual apontando ao diretório próprio no mesmo repositório. Sugestão: `pay.seudominio.com`, `mobile.seudominio.com` e `chat.seudominio.com` (nomes variáveis de ambiente).
- **Backend:** API Node.js com TypeScript, Fastify (ou Express se fundamentar tecnicamente), Socket.IO anexado a servidor HTTP único e hospedado em **Web Service no Render**, escutando `process.env.PORT` e `0.0.0.0`.
- **Autenticação:** um projeto Firebase Authentication compartilhado, Google OAuth para operadora/chat; Anonymous Authentication para a carteira visitante, quando aplicável.
- **Banco de dados:** Cloud Firestore, documentos e coleções JSON-like; **não é arquivo JSON local**, nem banco SQLite no disco efêmero do Render.
- **Uploads:** Cloudinary, com chaves privadas e assinaturas geradas exclusivamente no backend; usar transformações responsivas e políticas de acesso por tipo de arquivo.
- **Mensagens instantâneas:** Socket.IO para entrega e eventos transitórios, Firestore como fonte persistente da verdade.
- **Chamadas:** WebRTC para áudio/vídeo, Socket.IO apenas para sinalização, autorização e estados de chamada. Configurar STUN e, para produção confiável, **TURN** externo; chamadas de grupo só com arquitetura de SFU/serviço especializado claramente configurada.
- **Notificações web:** Web Push/FCM quando configurado, além de notificações internas; nunca prometer notificações push em dispositivos/browser que não autorizam a funcionalidade.
- **Deploy:** configurações específicas `render.yaml` quando apropriado; Vercel importando três apps, variáveis por ambiente e domínios com HTTPS.

**Separação de responsabilidades:** GitHub armazena e versiona código; **não hospeda em execução o backend Socket.IO**. Vercel hospeda o frontend; não colocar servidor Socket.IO persistente em Vercel Functions. Render é a aplicação Node persistente enquanto ativa. Firestore guarda dados; Cloudinary guarda mídia; o navegador só armazena estados temporários e cache.

### 2.2 Estrutura de monorepo sugerida

```text
nexa-ecosystem/
├── apps/
│   ├── pay/                  # Site do banco simulado
│   ├── mobile/               # Site da operadora
│   ├── chat/                 # Mensageiro completo
│   └── api/                  # API + HTTP server + Socket.IO
│       └── src/
│           ├── bootstrap/
│           ├── config/
│           ├── modules/
│           │   ├── auth/
│           │   ├── wallets/
│           │   ├── ledger/
│           │   ├── checkouts/
│           │   ├── numbers/
│           │   ├── telecom/
│           │   ├── profiles/
│           │   ├── contacts/
│           │   ├── conversations/
│           │   ├── messages/
│           │   ├── attachments/
│           │   ├── calls/
│           │   ├── notifications/
│           │   ├── reports/
│           │   └── abuse/
│           ├── realtime/
│           ├── middleware/
│           ├── workers/
│           └── tests/
├── packages/
│   ├── ui/                   # Componentes partilhados + glass tokens
│   ├── design-tokens/
│   ├── types/
│   ├── validation/           # Zod compartilhado
│   ├── sdk/                  # Cliente API tipado + Socket.IO
│   ├── firebase-client/
│   ├── utils/
│   └── config/
├── firestore.rules
├── firestore.indexes.json
├── firebase.json
├── .github/workflows/
├── docs/
├── ARCHITECTURE.md
├── DESIGN_SYSTEM.md
├── API_CONTRACTS.md
├── SECURITY.md
├── DEPLOYMENT.md
├── CHECKLIST.md
├── PROGRESSO.md
├── .env.example
├── README.md
└── package.json
```

### 2.3 Frontend recomendado

React, TypeScript estrito, Vite, Tailwind CSS, Motion for React (ou equivalente atual), GSAP/ScrollTrigger apenas onde necessário para narrativa scroll-scrub, TanStack Query para cache de requisições, React Hook Form + Zod para formulários, componentes acessíveis headless (Radix ou equivalentes), Zustand se necessário para estado de UI. Não adicione bibliotecas enormes sem justificativa; use imports dinâmicos e code splitting. Ícones vetoriais coerentes, **sem emojis como ícones de interface**. Fontes modernas licenciadas para web. Testes: Vitest, Testing Library, Playwright.

### 2.4 Padrões de engenharia

- TypeScript `strict`, schemas Zod nas fronteiras, API versionada `/v1`, mensagens de erro normalizadas, RFC problem details ou contrato equivalente.
- Dependency injection e separação `route/controller -> service -> repository`, regras de negócio fora de handlers HTTP/Socket.
- Sem segredos no cliente; configuração pública do Firebase não substitui Security Rules.
- E-mails e UID autenticados devem ser obtidos do Firebase ID Token validado no servidor, **nunca** confiados do corpo JSON.
- Timestamps e UUID/IDs de pedido emitidos no servidor; valores monetários em **centavos inteiros**.
- Paginação com cursor, índices planejados, quotas e telemetria com privacidade.
- `node --version` compatível com runtime Render; não depender de dados em disco.

## 3. DESIGN GERAL — ESTÉTICA PREMIUM LIQUID GLASS

### 3.1 Direção artística

Criar identidade autoral de nível premium inspirada no espírito de precisão e clareza de interfaces Apple, **não copiar logotipos, telas, marcas, assets ou códigos proprietários**. Combinação de tipografia editorial, amplos espaços vazios, profundidade, materiais translúcidos, microinterações e animação cinematográfica. Referência técnica de material: `https://developer.apple.com/design/human-interface-guidelines/materials`.

**Ponto crítico:** Liquid Glass nativo da Apple é um efeito de plataforma; na web, produzir uma **aproximação de alta fidelidade**, sem alegar pixel-perfect ou igualdade física garantida. Implementar refração/aparência adaptativa onde a plataforma e o desempenho permitirem. Evitar saturar todos os cartões de transparência: reservar glass mais expressivo para controles flutuantes, menus, barras, dock e elementos transitórios; superfícies de conteúdo usam materiais legíveis.

### 3.2 Como construir o efeito glass na web

Criar componentes reutilizáveis: `GlassSurface`, `GlassButton`, `GlassDock`, `GlassModal`, `GlassPopover`, `GlassToast`, `GlassNav`, `GlassSearch`, `GlassInput`, `GlassTooltip`, `GlassCard` (este último com efeito reduzido).

Camadas internas sugeridas:

1. **Backdrop real:** `backdrop-filter: blur(...) saturate(...)` em superfícies com alfa, gradiente transparente e fallback sem blur.
2. **Borda óptica:** highlight fino e assimétrico, gradiente direcional, luminosidade mais pronunciada nas bordas voltadas à fonte de luz.
3. **Rim/caustic delicado:** reflexo especular movendo-se lentamente com cursor/giroscópio quando permitido, respeitando limites de animação.
4. **Volume:** sombra macia externa + brilho interno, sem aparência de 'cartão branco semitransparente' barato.
5. **Tint adaptativo:** ajustar brilho/contraste conforme tema, luminosidade aproximada do fundo e contexto; uso de `color-mix`, overlays e variáveis CSS.
6. **Lensing/refração:** usar SVG filters, shaders WebGL/WebGPU somente em áreas principais e dispositivos adequados, com degradação elegante; `backdrop-filter` sozinho **não implementa refração física**.
7. **Resposta interativa:** deformação extremamente controlada e spring ao pressionar/arrastar, brilho deslocando com ponteiro e retorno natural; nunca distorcer texto ou ícones.
8. **Controle de nitidez:** camada de texto acima do glass com contraste WCAG, estados hover/focus/disabled e fallback high contrast.

Tokens configuráveis: `--glass-blur`, `--glass-tint`, `--glass-opacity`, `--glass-border`, `--glass-shadow`, `--glass-highlight`, `--glass-radius`, `--motion-fast`, `--motion-standard`, `--motion-hero`. Fornecer variantes `clear`, `regular`, `solid-fallback` e `dark`.

Não aplicar `backdrop-filter` pesado em dezenas de elementos simultâneos. Fazer medição de frames e memória, renderizações GPU sob demanda, desligamento de efeitos pesados em aparelhos fracos, preferência `prefers-reduced-motion`, `prefers-reduced-transparency` onde suportada ou controle equivalente. Implementar tema claro/escuro/sistema.

### 3.3 Linguagem de animação

Quero movimento perceptível, refinado, consistente e tecnicamente complexo quando fizer sentido — **não confundir complexidade com lentidão**.

- Transições de rota com dissolução, slide sutil e continuidade de elementos compartilhados.
- Botões com compressão/spring, ripple/reflexo óptico discreto, feedback de sucesso e erro.
- Menus/dropdowns como superfícies líquidas que expandem a partir do ponto de origem.
- Modais com profundidade e backdrop adaptativo; transições acessíveis e canceláveis.
- Listas com entrada escalonada limitada; skeleton shimmer leve, imagens com fade progressivo.
- Barra inferior que reage à seleção com indicador elástico.
- Scroll reveal com opacidade, blur temporário leve e deslocamento, sem deixar conteúdo invisível caso JS falhe.
- Confetes ou efeitos de celebração somente em compra concluída; não a cada clique.
- Animações de mensagens tipo mensageiro premium: chegada, status, typing dots, swipe to reply.
- Gestos mobile para ações relevantes (arrastar resposta, fechar drawer, segurar áudio); mouse/teclado equivalentes obrigatórios.
- Curvas spring com parâmetros por contexto; durações de microinteração em geral ~120–320 ms, transições mais amplas 300–650 ms; cenas de marketing podem ser longas e ligadas ao scroll.
- `requestAnimationFrame`, transforms e opacity como propriedades preferenciais; evitar animar layout custoso e não usar `will-change` indiscriminadamente.

### 3.4 Responsividade e acessibilidade

**Mobile-first e desktop completo**, já que este projeto não especificou exclusividade mobile. Mobile deve parecer app nativo; desktop deve ter painéis de maior densidade para operadora e chat. Respeitar safe-area, teclado virtual, toque, foco visível, tab navigation, screen readers, contraste, zoom de 200%, tamanhos mínimos de toque. Evitar scroll horizontal inesperado, overlays que prendem foco ou efeitos que prejudiquem leitura. Textos em pt-BR, datas e moeda brasileiras, timezone coerente.

## 4. NEXA MOBILE — OPERADORA PREMIUM (SITE 2)

### 4.1 Website institucional e comercial

Este deve ser o site visualmente mais impressionante do ecossistema. Criar **página de marketing cinematográfica**, elegante, responsiva, com 8–12 seções conectadas por uma narrativa visual contínua. Sem templates genéricos.

Estrutura sugerida:

1. **Preloader elegante e não intrusivo:** logo vetorial NEXA que monta suavemente, duração limitada, não bloqueia navegação desnecessariamente.
2. **Header glass flutuante:** marca, funcionalidades, como funciona, preços, FAQ, login, CTA. Scroll-condensing e menu mobile sofisticado.
3. **Hero full-bleed:** mockup 3D original de smartphone suspenso com chip/número virtual flutuando, luz ambiente sutil, tipografia grande com copy clara e CTA `Escolher meu número`.
4. **Scroll-cinema A — nascimento de um número:** sequência de imagens/frames em tela onde elementos luminosos se aproximam, se alinham e formam um cartão com número virtual. Parallax real em camadas, progressivo, sincronizado com scroll.
5. **Benefícios:** identidade única, cadastro simples, conexão com NEXA Chat, histórico persistente, segurança; cards interativos com animação independente.
6. **Scroll-cinema B — do número à conversa:** avatar e chip se transformam em bolhas de mensagem e interface de chat, com transição entre cenas e objeto persistente.
7. **Como funciona:** autenticar com Google, escolher número, pagar com créditos NEXA Pay, ativar chat. Timeline animada ligada ao scroll.
8. **Vitrine de números:** grid interativo consultando API com preview (pode exibir amostras e preço sem login); busca e filtro por DDD simulado, padrão, disponibilidade.
9. **Demonstração integrada:** mini-experiência interativa de tela de compra ao lado de representação da carteira demo.
10. **Preços e transparência:** preço de exemplo configurável (sugestão inicial R$ 29,90 em créditos fictícios), sem taxas reais, explicação de simulação e termos.
11. **FAQ:** o número recebe SMS real? (Não); o Pix usa dinheiro? (Não); cadastro Google? (Sim); chamadas são reais pela internet entre usuários? (Sim, quando infraestrutura WebRTC disponível); etc.
12. **CTA final + footer:** transição cinematográfica controlada e links para Pay, Chat, política de privacidade, termos e suporte.

### 4.2 Efeito de vídeo controlado pelo scroll — exigência especial

Criar as cenas a partir de uma **estratégia funcional**: sequência `.webp`/`.avif`/sprites com frames em resolução adaptativa ou vídeo que suporte busca por tempo, e fallback estático. Escolher a técnica mais robusta ao testar navegadores; não descarregar centenas de frames sem orçamento. Implementar:

- Section sticky/pinned com `ScrollTrigger` ou scroll timeline suportada; progresso `0..1` controla frame correspondente e camadas simultâneas.
- Pré-carregar próximo conjunto sob demanda, descarregar cenas longe da viewport, reduzir frames para mobile fraco.
- Interpolação/easing consistente para objetos que se movem; evitar travar a rolagem normal do usuário.
- Scroll reverso deve reproduzir a animação inversamente sem glitches.
- Pausa e fallback em `prefers-reduced-motion`, queda de FPS, pouca memória ou sem JavaScript.
- Poster visível até mídia estar pronta; comportamento definido em conexão lenta.
- Arte original e de alta qualidade (não usar imagens de terceiros sem licença, nem arquivos inexistentes). Se não houver assets 3D/frames, gerar uma cena animada CSS/SVG realista e documentar assets pendentes — nunca apresentar um placeholder como solução completa.
- Orçamento explícito de bytes por cena; medir LCP, CLS, INP e CPU/memória.

### 4.3 Cadastro, conta e perfis

- Login Google via Firebase Auth, estado autenticado persistente, saída e revogação.
- Primeiro acesso cria `users/{uid}` pelo backend de maneira idempotente.
- Perfil: nome exibido, avatar, e-mail Google verificado quando disponível, ID, data de adesão, preferências e consentimentos.
- Conta: editar dados permitidos, foto via Cloudinary, escolher tema, notificações, ver dispositivos/sessões quando implementado, sair, exportar dados e solicitar exclusão.
- Rotas privadas protegidas também **no servidor**; guard React serve apenas para UX.

### 4.4 Catálogo de números virtuais

- Números com aparência brasileira (`+55 (DD) 9XXXX-XXXX`) em **namespace fictício de demonstração**, únicos exclusivamente dentro do sistema. A UI deve chamá-los claramente de `Número NEXA` e nunca sugerir linha real.
- Nunca prometer posse de uma linha telefônica real ou permitir SMS/voz da rede de telefonia.
- Gerador no backend com estoque e bloqueio temporário; gerenciar DDDs/padrões permitidos sem colisão.
- Filtros: DDD, sequência, preço, recém-adicionados, mais populares (com dados reais, não inventados).
- Página de detalhe: número, indicador `disponível/reservado/vendido`, preço, descrição, CTA `Comprar número`.
- Reserva temporária do número quando usuário entra no checkout, com TTL server-side e liberação em timeout/cancelamento. Revalidar no ato de provisionamento.
- Estado de pedido: `CREATED -> RESERVED -> AWAITING_PAYMENT -> PAID -> PROVISIONING -> ACTIVE` ou `EXPIRED/FAILED/CANCELLED/REFUNDED`; registrar transições válidas e timestamps.
- Conta pode possuir múltiplos números, com um `principal` selecionado. Não permitir vincular o mesmo número a duas contas.
- **Proibir compra/alteração de preço/status diretamente pelo client SDK**. Administração de estoque e preço via backend com permissão específica.

### 4.5 Área logada da operadora

Rotas/telas:
- Dashboard com saudação, números ativos, número principal, botão `Abrir NEXA Chat`, ações rápidas, últimas compras.
- Meus números: listagem, seleção principal, data de compra, detalhes, status, histórico e identificação do proprietário.
- Explorar números: busca/filtros/paginação reais.
- Detalhe e checkout: resumo, passo a passo, timer de reserva e instruções claras.
- Pedidos: histórico, recibo simulado, status atual com polling adaptativo/WebSocket/eventos.
- Conta e configurações: perfil, segurança, privacidade, notificações, gerenciamento de dados, sair.
- Central de ajuda/FAQ e página de suporte transparente.
- Erros e vazios de UX exemplares (nenhum número, sessão expirada, já comprado por outra pessoa, serviço indisponível, saldo insuficiente).

## 5. NEXA PAY — BANCO VIRTUAL SIMULADO (SITE 1)

### 5.1 Regra geral

Visitante chega e já vê saldo **R$ 300,00**, com cadastro desnecessário. Essa é uma **carteira individual de demonstração**. Criar sessão anônima no servidor/Firebase Auth sob o capô. Exibir de forma visível `AMBIENTE DE SIMULAÇÃO — NÃO É DINHEIRO REAL`. Nunca criar QR Pix BR Code realmente pagável, solicitar senha bancária, chave Pix verdadeira, CPF para pagamentos fictícios ou dados reais de contas bancárias. Recibos com marca d'água `SIMULADO / SEM VALOR FISCAL OU BANCÁRIO`.

### 5.2 Telas e operações

- Tela inicial: cartão de saldo, valor disponível, mostrar/ocultar valor, avatar genérico, ações `Pix simulado`, `Pagar pedido`, `Extrato`, `Comprovantes`, `Ajuda`.
- Onboarding pequeno explicando a simulação e perda de carteira em limpeza de navegador.
- Pix interno simulado: enviar créditos entre carteiras demo identificadas por **chaves internas NEXA**, com validação de destinatário pelo backend; jamais representar um envio a chaves reais do Pix.
- Receber créditos simulados: gerar chave interna NEXA e QR de **URL NEXA própria** ou código de transferência interno; não usar payload BR Code/EMV verdadeiro.
- Fluxo de pagamento de compra: entrada com checkout token válido, cartão de resumo (NEXA Mobile, número reservado, preço, validade), confirmação detalhada, processamento atômico, comprovante e retorno à Mobile.
- Extrato: entradas/saídas ordenadas por data, filtros por tipo/período/status, busca, ícones claros, agrupamento por dia e paginação.
- Detalhe de transação: identificador, data e hora, origem, destino, valor, tipo, status e referência de pedido, botão de copiar protocolo.
- Comprovantes: layout de recibo visualmente lindo, exportação PDF opcional com selo simulação.
- Perfil do visitante: identificador temporário, saldo, data de criação, aviso da natureza descartável e ação de redefinição **somente quando autorizada pelo backend e política de demonstração**.
- Histórico de pagamentos NEXA Mobile, vinculado a identificadores de pedidos, sem expor e-mail da conta Google ao visitante.
- Estados de saldo insuficiente, código expirado, cobrança já quitada, perda de conexão, transação recusada, saldo desatualizado, operação duplicada.

### 5.3 Carteira e ledger seguros

O saldo inicial NÃO pode ser escrito diretamente pelo navegador. Criar `wallet` por transação única e marcador de benefício inicial. `balanceCents = 30000`. Toda operação monetária é uma transação atômica no Firestore **executada pelo servidor com Firebase Admin SDK**, que:

1. Verifica usuário/sessão e permissões.
2. Confere idempotency key, destinatário e saldo em centavos.
3. Lê estados relevantes **antes** de gravar, conforme semântica Firestore.
4. Aplica débito/crédito de uma só vez com documentos ledger imutáveis e timestamp do servidor.
5. Impede saldo negativo, self-transfer abusivo, overflows, duplicidade e conflito entre operações paralelas.
6. Guarda estado de operação e devolve mesmo resultado se a mesma chave de idempotência for reenviada.
7. Para pagamento da operadora, altera pedido e ledger atomically quando possível; se provisionamento for separado, usa estado intermediário durável, processador idempotente e rotina de reconciliação.
8. Nunca aceita `balance`, `price`, `paid`, `approved`, `recipientUid` livre ou `ownerUid` como autoridade vindos do navegador.

Sobre abuso: autenticação anônima sozinha **não impede** alguém de criar infinitas sessões; adicionar controles de demonstração proporcionais (App Check quando viável, limites por dispositivo/IP com privacidade, quotas por período, sinalização de abuso, limites de carteira e compras, monitoramento). Explicar no documento de produto que créditos de demonstração são recreáveis por novos visitantes, e não fingir rigor financeiro equivalente a um banco real.

## 6. PAGAMENTO ENTRE OS SITES — FLUXO DETALHADO E SEGURO

**Não compartilhar localStorage/cookies entre domínios diferentes e não confiar na aba de retorno.** O fluxo deve ser inteiramente server-mediated:

1. Operadora com Firebase Google JWT válido chama `POST /v1/mobile/orders`, informando apenas `numberId` e chave de idempotência.
2. Servidor identifica `uid` via JWT, reserva o número disponível, consulta preço no DB e cria `orderId`, `expectedAmountCents`, `expiresAt` e `checkoutTicket` opaco com TTL, audience e uso limitado.
3. Navegador redireciona para NEXA Pay `.../checkout?ticket=...`; ticket **não é credencial de acesso universal**, deve ser redimido/circunscrito no backend, expirar e nunca revelar dados privados. Remover ticket da barra URL após uso quando possível; política `Referrer-Policy` adequada.
4. NEXA Pay autentica visitante anonimamente e consulta ao servidor os dados públicos mínimos necessários daquele checkout.
5. Visitante vê cobrança e confirma. `POST /v1/pay/checkouts/:id/confirm`, com JWT anônimo, valida pedido em aberto, saldo, reserva e idempotência.
6. Firestore transaction debita carteira demo, registra ledger, marca checkout pago e pedido como `PAID` sem execução duplicada.
7. Servidor confirma o direito de provisionar, associa número ao `uid` do pedido e marca `ACTIVE` por operação idempotente. Se falhar, deixar `PAID_PENDING_ACTIVATION` e reconciliar; nunca desaparecer com o pagamento.
8. Pay oferece `Voltar para NEXA Mobile`, usando URL allowlist, somente com identificador público de pedido/status; **não** carregar `paid=true` como prova.
9. Operadora busca `GET /v1/mobile/orders/:id` autenticada como proprietário, atualiza a UI ao confirmar status real no servidor e apresenta número.
10. Checkout expirado/cancelado não pode cobrar; se pagamento confirmado e provisionamento impossível, projetar estorno **simulado** determinístico e auditado ou conclusão com reserva garantida.

Testar dois visitantes tentando comprar mesmo número, cliques repetidos, múltiplas abas, perda de rede após confirmar, requisição duplicada, timeout do Render, reconexão tardia, pedido pago sem retorno, manipulação de valor, troca do `uid` e tentativa de pegar checkout de outro usuário.

## 7. NEXA CHAT — MENSAGEIRO COMPLETO (SITE 3)

### 7.1 Entrada e registro

- Splash bonito e curto, com checagem de sessão e serviço, sem atrasar usuários recorrentes.
- Tela `Insira seu número NEXA` com máscara brasileira e informação de que o número precisa ser comprado na NEXA Mobile.
- Ao prosseguir, exigir autenticação Google **do mesmo projeto Firebase**. Mesmo e-mail visual não é prova suficiente: comparar o `uid` autenticado com `ownerUid` da linha no backend.
- Quando usuário já logado possuir vários números, oferecer seletor dos próprios números e permitir escolher identidade principal.
- Quando digitado número de outra pessoa, devolver erro genérico que não exponha e-mail/identidade do dono.
- Se não possuir número, CTA com deep link para compra na operadora, preservando intenção com `state` seguro e não aberto a redirect malicioso.
- Primeira ativação: cadastrar perfil no chat (`displayName`, `avatar`, `about`, privacidade, tema, preferências), vinculado a `uid` + `numberId` via operação do servidor.
- Nos acessos seguintes, login Google normal, carregamento dos dados salvos no Firestore e entrada direta no chat, sem exigir reconcluir onboarding.
- Não usar SMS OTP real: números são virtuais **internos e não recebem SMS**. A prova de propriedade vem da NEXA Mobile/Firebase.

### 7.2 Home, layout e navegação

**Mobile:** barra superior com avatar/título/busca/novo chat, lista de conversas; bottom navigation glass para Conversas, Chamadas, Contatos, Configurações. Tela aberta ocupa canvas; composer fixo acima do teclado; safe areas e gestos naturais.

**Desktop:** coluna de conversas com busca/filtros e perfil; conversa ativa à direita; painel de detalhes opcional. Layout refinado, preferências de largura, atalhos de teclado e drag-and-drop.

Páginas: boas-vindas, cadastro do chat, conversas, chat individual, grupos, lista de chamadas, contatos, solicitações de contato, mídia/arquivos, mensagens favoritas, notificações, perfil, conta, privacidade, aparência, armazenamento, dispositivos, ajuda.

### 7.3 Mensageria

Mensagens privadas e em grupo com:

- Texto UTF-8, quebras de linha e emojis como **conteúdo do usuário** (não como ícones de UI), markdown básico **seguro se habilitado**, links detectados e previews isolados e sanitizados.
- Envio em tempo real via Socket.IO, persistência de mensagem pelo backend no Firestore, confirmação (`sending`, `sent`, `delivered`, `read`, `failed`) com semântica definida por conversa/dispositivo.
- Optimistic UI com rollback/retry; `clientMessageId` único e idempotência para não duplicar mensagens após reconexão.
- Ordenação por timestamps do servidor + tie-breaker estável, cursores de paginação e carregamento progressivo de mensagens anteriores; rolagem não pode saltar ao receber nova mensagem se usuário estiver lendo histórico.
- Editar mensagem com indicador e janela configurável; apagar para mim / apagar para todos sujeito a política de servidor; soft-delete/tombstone auditável quando necessário.
- Responder citando, encaminhar com permissão, copiar, selecionar várias, fixar, favoritar/salvar, reagir, menu contextual e busca por texto dentro da conversa conforme índices/estratégia real.
- `typing`, `recording`, `online`, `lastSeen` como eventos efêmeros/estado agregado com privacidade e TTL. Firestore não oferece presença nativa confiável: usar Socket.IO com heartbeat e lógica durável para rede, ou Firebase Realtime Database caso necessário; não usar polling Firestore agressivo.
- Agrupar mensagens por dia e remetente, data/hora local, separador de não lidas, badge, mensagens de sistema e confirmação visual com acessibilidade.
- `unreadCount` e `lastMessage` por membro, atualizados no servidor de maneira consistente; evitar scan integral do histórico.
- Proteção contra spam: limites por mensagem/minuto, texto máximo, bloqueios, denúncias e rejeição de payloads grandes.
- Estados quando usuário é bloqueado, saiu do grupo, conversa apagada, perdeu a sessão ou servidor offline.

### 7.4 Mídia, arquivos e áudios

- Fotos: escolher da galeria/câmera com permissão, preview, compactação adequada, rotação EXIF, thumbnail, download autorizado, zoom e visualizador fullscreen.
- Vídeos: upload e reprodução adaptativa quando Cloudinary suportar, limite configurável de tempo/tamanho, pôster e progresso.
- Mensagens de voz: MediaRecorder web com permissão, timer, forma de onda opcional, playback com velocidades 1x/1.5x/2x, pausar, descartar, retomar upload e status de entrega.
- Documentos: PDF e arquivos permitidos com extensão/MIME permitidos, nome, tamanho, download seguro e scanner/inspeção quando disponível. Bloquear conteúdo executável e arquivos perigosos.
- Compartilhar localização **somente** como URL/mapa opcional com consentimento, não rastrear localização contínua.
- Pré-visualização e galeria de mídias de cada conversa, favoritos e downloads.
- Limites documentados por categoria, quota individual e custo por transformação/banda; progressos com cancelamento.
- **Privacidade:** avatar e assets de marketing podem ser públicos; mídia privada do chat não deve ser entregue por URL pública previsível. Utilizar mecanismos Cloudinary `private/authenticated` ou alternativa segura de entrega temporária com controle de permissão, configuração e testes, sem assumir que um URL assinado por upload protege download.
- Cloudinary `api_secret` somente no backend, assinatura de upload com parâmetros restritos, tipos MIME inspecionados e tamanho máximo. Guardar no Firestore apenas metadados, `public_id`, `assetId`, ownership, status e informações necessárias; apagar mídia órfã de forma controlada.
- **Não prometer criptografia ponta a ponta** a menos que exista implementação criptográfica completa e auditada; TLS em trânsito + controle de acesso não equivalem a E2EE.

### 7.5 Contatos e descoberta

- Adicionar contato digitando número NEXA; API resolve número habilitado com limite anti-enumeração e controles de visibilidade.
- Salvar apelido privado no catálogo de contatos do próprio `uid`; foto/nome públicos obedecem à privacidade do dono.
- Busca por nome local e número autorizado, contatos recentes, favoritos, bloqueados e convites pelo link NEXA.
- Solicitação de contato opcional/controle de privacidade para impedir mensagens indesejadas; permissões e denúncia.
- Importar agenda do aparelho **não obrigatório**, somente com consentimento explícito e suporte do navegador; nunca carregar silenciosamente lista de contatos do dispositivo.

### 7.6 Grupos

- Criar grupo com nome, foto, descrição, link de convite revogável e membros iniciais.
- Papéis `owner`, `admin`, `member`, transições de dono com regras, ações de promover/remover, sair/excluir com regras claras.
- Convites de token com expiração/revogação/uso limitado, aprovação para entrar quando configurada, bloqueio de convites suspeitos.
- Configurações: somente admins alteram detalhes/mandam mensagens quando modo restrito, silenciar, foto, histórico de novos membros, mensagens fixadas.
- Eventos de entrada/saída e moderação consistentes, validação no backend para cada operação e broadcast a membros autorizados.
- Limite de membros definido e testado para infraestrutura inicial; grupos grandes necessitam arquitetura adicional.

### 7.7 Chamadas de voz e vídeo

Implementar **1:1 primeiro com qualidade**, depois planejar grupo. Fluxo:

1. Iniciador chama `POST /v1/calls` ou envia evento autorizado `call:invite`, backend valida identidade, relações, bloqueios e conexão.
2. Socket.IO transmite `call:ringing` ao destinatário autorizado e atualiza estado `INVITED/RINGING/ACCEPTED/CONNECTED/ENDED/MISSED/REJECTED/FAILED`.
3. Autenticar participantes do canal de sinalização; trocar `offer`, `answer`, `ICE candidates` em salas privadas autorizadas e com TTL.
4. Pedir `getUserMedia` no momento apropriado, com erro amigável quando permissão bloqueada; disponibilizar preview e controles.
5. Criar `RTCPeerConnection` com STUN configurável e TURN credenciado temporariamente, nunca segredos TURN estáticos no bundle. WebRTC é o caminho de áudio/vídeo; Socket.IO **não transmite mídia bruta**.
6. UI para aceitar, rejeitar, encerrar, mute/unmute microfone, liga/desliga câmera, alternar câmera, escolher dispositivo disponível, mostrar duração/estado/qualidade, fullscreen e trocar câmera em mobile se suportado.
7. Tratar ICE restart, mudança de rede, perda de conexão, hangup de qualquer parte, várias abas/dispositivos, chamadas simultâneas, timeout e reconexão.
8. Notificações push para chamada só como aprimoramento possível; web push, permissões e execução em background não garantem tocar/despertar o aplicativo como uma ligação celular nativa.
9. Registrar histórico de chamadas e duração server-side de forma privada; **não gravar mídia por padrão**. Consentimento explícito para eventual gravação futura.
10. Para chamadas em grupo com várias câmeras, projetar uma segunda fase usando SFU (ex.: serviço compatível, com custo/configuração próprios); não prometer grupo 10+ com malha P2P improvisada.

Criar tela de chamada grande e premium, com gradiente dinâmico/avatar animado para áudio e vídeo responsivo; efeitos visuais não devem comprometer áudio, bateria ou desempenho. Pré-checagem de microfone e câmera, bandejas glass, indicadores de rede e transição suave entre telas.

### 7.8 Notificações

- Toasts in-app para mensagens, menções, chamadas, novas solicitações, convites e eventos.
- Contagem não lida persistida e atualizada eficientemente; som opcional, respeitando controles de autoplay.
- Web Push/FCM com service worker, autorização opt-in, tokens por navegador/dispositivo, revogação, deduplicação e respeito ao sistema.
- Configurações por conversa/grupo: silenciar por prazo, sempre/sem som, pré-visualização no lock screen limitada à plataforma, horário de não perturbe.
- Não expor conteúdo privado de mensagens em notificações de navegador quando usuário desativar prévias.
- Rota de notificação abre conversa certa após autenticação e checagem de permissão.

### 7.9 Perfil e configurações do Chat

**Perfil:** foto, nome, bio/recado, número NEXA, link para compartilhar perfil, status visível, editar.

**Privacidade:** quem vê foto/bio/último acesso/online; quem pode adicionar a grupo; confirmações de leitura liga/desliga; contatos bloqueados, denunciar, convites, silenciar desconhecidos, exclusão/exportação de dados.

**Aparência:** claro/escuro/sistema, wallpaper de conversa original ou upload, tamanho de fonte, densidade da interface, intensidade de animações, transparência reduzida, visualização prévia.

**Conversas:** arquivar, fixar, silenciar, limpar histórico local vs apagar de backend, exportar dados quando autorizado, backup lógico em Firestore, gerenciamento de mídias.

**Notificações:** sons, vibração quando suportada, push, mensagens e chamadas, alertas por conversa.

**Dispositivos e segurança:** listar sessões se infraestrutura de sessões existir de fato, encerrar sessão atual, revogar tokens quando disponível, confirmar ações críticas, permitir logoff. Não prometer listagem de todos os dispositivos caso não seja implementada.

**Ajuda/sobre:** termos, privacidade, versão, contato, explicar que número NEXA não é número real de operadora.

## 8. BACKEND — DOMÍNIOS, API E CONTRATOS

Criar REST e Socket.IO documentados via OpenAPI gerada/validada a partir de schemas, e cliente TypeScript compartilhado. Exemplo de mapa de rotas, ajustar nomenclatura com documentação se necessário:

```text
GET    /health/live                     # Processo HTTP vivo
GET    /health/ready                    # Firestore/config críticos prontos
GET    /v1/public/config                 # Somente informações públicas
POST   /v1/guest/session                 # Iniciar sessão demo autenticada
GET    /v1/pay/wallet                    # Carteira do visitante
GET    /v1/pay/transactions              # Extrato paginado
GET    /v1/pay/transactions/:id          # Recibo simulado
POST   /v1/pay/transfers                 # Transferência entre contas demo
GET    /v1/pay/checkouts/:ticket         # Prévia mínima do checkout
POST   /v1/pay/checkouts/:id/confirm     # Liquidar pagamento simulado
GET    /v1/mobile/numbers                # Catálogo paginado com filtros
GET    /v1/mobile/numbers/:id
POST   /v1/mobile/orders                 # Reserva + pedido, autenticado
GET    /v1/mobile/orders/:id             # Somente proprietário
GET    /v1/mobile/me/numbers
PATCH  /v1/mobile/me/primary-number
GET    /v1/me                            # Identidade central
PATCH  /v1/me                            # Campos permitidos
POST   /v1/chat/activate                 # Exigir ownership de número
GET    /v1/chat/me
PATCH  /v1/chat/me
GET    /v1/chat/contacts
POST   /v1/chat/contacts
DELETE /v1/chat/contacts/:id
GET    /v1/chat/conversations
POST   /v1/chat/conversations
GET    /v1/chat/conversations/:id/messages
POST   /v1/chat/conversations/:id/messages
PATCH  /v1/chat/messages/:id
DELETE /v1/chat/messages/:id
POST   /v1/chat/messages/:id/reactions
POST   /v1/chat/groups
PATCH  /v1/chat/groups/:id
POST   /v1/chat/groups/:id/members
POST   /v1/chat/groups/:id/invites
POST   /v1/media/upload-authorizations   # Upload com política segura
POST   /v1/media/complete                # Verificação pós upload
POST   /v1/calls                          # Convite de chamada
GET    /v1/calls/history
POST   /v1/calls/:id/end
POST   /v1/chat/report
POST   /v1/chat/block
POST   /v1/notifications/subscriptions
DELETE /v1/notifications/subscriptions/:id
```

**Socket.IO namespaces/rooms conceituais**: conexão com Firebase ID Token verificado em handshake, namespace `/chat`, `/presence` (se realmente útil), `/calls`; rooms `user:{uid}`, `conversation:{id}`, `call:{id}` com participação verificada antes do join. Eventos sugeridos: `message:send`, `message:ack`, `message:new`, `message:update`, `message:delete`, `typing:start`, `typing:stop`, `receipt:update`, `presence:update`, `call:invite`, `call:ringing`, `call:accept`, `call:reject`, `call:offer`, `call:answer`, `call:ice`, `call:end`. Eventos do cliente **não** podem entrar arbitrariamente em rooms nem emitir payload para user IDs sem checagem no servidor.

Integridade de mensagens: escolha **um único caminho autoritativo de escrita** (preferência servidor via REST/Socket ambos chamando mesmo service), Firestore commit antes de enviar ACK `persisted`; difusão após escrita; ao reconectar, buscar mensagens persistidas desde último cursor para garantir que Socket.IO desconectado não implica perda de histórico. `Socket.IO delivery` não substitui persistência. **Não** duplicar escrita do cliente Firebase SDK e do servidor em paralelo.

## 9. FIRESTORE — MODELO DE DADOS PROPOSTO

Modelar esquema real, índices, cardinalidade, TTL, retenção e estratégia de leitura/custo. Exemplo de coleções:

```text
users/{uid}
users/{uid}/preferences/{doc}
users/{uid}/numbers/{numberId}               # projeção/índice do ownership
numbers/{numberId}                           # identidade virtual, state, ownerUid
numberReservations/{reservationId}            # expiresAt, orderId
numberCatalog/{id}                           # listagem publicável (opcional)
orders/{orderId}                              # ownerUid, numberId, amountCents, state
checkouts/{checkoutId}                        # orderId, one-time token hash, expiry
wallets/{guestUid}                            # balanceCents, grant flag
walletLedger/{entryId}                        # append-only debit/credit/opId
walletOperations/{operationId}                # idempotência e resultado
paymentReceipts/{receiptId}                   # valor e selo SIMULADO
chatProfiles/{uid}                            # profile, settings, activeNumberId
contacts/{uid}/items/{contactId}              # apelido privado
conversations/{conversationId}                # type, membership summary
conversations/{conversationId}/members/{uid}  # role, mute, unread, lastRead
conversations/{conversationId}/messages/{id}  # body, senderUid, metadata, attachments
conversations/{conversationId}/events/{id}    # auditoria de grupo mínima
attachments/{attachmentId}                    # resource, owner, access, scan state
calls/{callId}                                # history/state/participants
pushSubscriptions/{uid}/devices/{deviceId}
reports/{reportId}
blocks/{uid}/items/{blockedUid}
auditLogs/{eventId}                           # servidor apenas
rateLimits/{key}                              # proteção com TTL quando aplicável
```

Esquemas versionados (`schemaVersion`) e migrações. Não registrar dados sensíveis desnecessários. Índices compostos para listagem por `uid+createdAt`, busca de números por `status+DDD+price`, mensagens por `createdAt`, pedidos por usuário e status, operações por chave. Paginar em vez de ler coleções inteiras. Não armazenar blobs de imagem ou áudio no Firestore; **Cloudinary guarda mídia**. Não armazenar arquivos na máquina Render. Firestore possui documento máximo e limites próprios; respeitar e modelar para escala. Tratar duplicação eventual entre metadados (última mensagem, contador) por reconciliador.

## 10. FIREBASE AUTH E SEGURANÇA DE ACESSO

- Habilitar Google provider para operadora/chat e provider anônimo somente para wallet demo; configurar domínios autorizados e fluxos redirect/popup com fallback conforme browser.
- O Firebase Authentication do navegador não transfere automaticamente a sessão entre três origens. Implementar login por projeto Firebase em cada app ou ponte segura server-mediated se realmente necessária; nunca transportar JWT em query string ou `postMessage` indiscriminado.
- Backend usa Firebase Admin SDK para validar ID Token e `uid`. Reavaliar ownership de número e conversa em **toda operação sensível**, não só no login.
- Definir roteamento e sessão: tokens curtos renováveis pelo Firebase SDK, reconexão Socket.IO com credencial atual, revogação e tratamento de `401`/`403`.
- Security Rules Firestore **deny-by-default**, campos permitidos explicitamente e validações; por padrão, bloquear todas as escritas diretas em `wallets`, `walletLedger`, `orders`, `checkouts`, `numbers`, `auditLogs`, `calls` sensíveis e mensagens se a escrita autoritativa for exclusivamente backend.
- Implementar leituras clientes mínimas **ou preferir API autenticada** para todos os recursos críticos; se usar listeners Firestore diretamente, regras restritas ao proprietário/membro e testes de permissão por documentos/queries.
- O Admin SDK **ignora Security Rules**, logo serviços backend devem realizar autorização obrigatória e testes de isolamento de tenant/usuário.
- CORS allowlist exata dos três domínios (origens), localhost só em dev; CORS não é autenticação. Usar CSRF tokens se algum endpoint utilizar cookies; bearer auth + controle correto de origem, XSS e refresh.
- HTTP security headers: HSTS quando HTTPS, CSP cuidadosamente construída para Firebase/Cloudinary, `nosniff`, política de referrer, frame ancestors; validação de redirects e prevenção de open redirect.
- Zod por endpoint e por evento Socket.IO, rate limiting por conta/sessão/IP respeitando proteção de dados, tamanho máximo, limites de uploads, logs estruturados com request ID e sem bearer tokens.
- Limites para enumeração de número/usuários, tentativas de compra repetidas, brute-force, spam, convites e chamadas excessivas; bloquear, denunciar, moderar e suspender pelo backend.
- Segredos via Render environment variables e Vercel env com prefixo público somente nos campos realmente publicáveis; não salvar `.env` no Git.
- Dependências atualizadas, `npm audit` ou equivalente, CI com secret scanner, TypeScript strict, prevenção de XSS em conteúdo de chat, validação de links/uploads, SQLi não aplicável ao Firestore mas não supor ausência de injeções/NoSQL abuse.
- Auditoria de ações: login/ativação, provisionamento, transferência, alteração de saldo, administração, denúncias e exclusões, com minimização de PII e retenção definida.
- Privacidade brasileira/LGPD: base e finalidade dos dados, política acessível, minimização, portabilidade/exportação quando possível, exclusão e prazos; não inferir que autenticação Google autoriza tratamento irrestrito.
- Modelo de ameaças e testes explícitos contra IDOR, token replay, race conditions, CSRF conforme implementação, XSS, manipulação de preço/saldo, abuso de uploads, membership spoofing e signaling WebRTC não autorizado.

## 11. RENDER DORMINDO — BOOT SCREEN EXIGIDA

O frontend deve distinguir: `appReady`, `backendStarting`, `backendReady`, `offline`, `maintenance`, `error`. Não usar spinner infinito ou afirmar que serviço está acordando sem evidência.

### 11.1 Máquina de estados de inicialização

1. Renderizar a página imediatamente e checar API `/health/ready` com timeout razoável. Landing pública Mobile pode carregar sem backend e mostrar conteúdos estáticos; ações que dependem de API têm estado próprio.
2. Se API responder 200, prosseguir normalmente, iniciar autenticação/SDK/Sockets e sincronizar dados.
3. Se conexão atrasar, falhar por timeout ou receber resposta coerente com cold start, abrir uma **tela Glass full-screen premium**: ícone NEXA com brilho em movimento, barra/anel de progresso **indeterminado**, texto `Conectando ao servidor`, subtítulo `Nosso servidor pode estar iniciando. Seus dados permanecem salvos.`; mostrar mensagens secundárias alternadas, sem porcentagem falsa.
4. Retry automático usando exponential backoff com jitter (por exemplo 2s, 4s, 8s, 12s limitado); botão `Tentar novamente`, `Voltar` e link de ajuda, cancelamento e limite definido; ao voltar, animação suave de saída e recuperação do estado anterior.
5. Detectar explicitamente `navigator.onLine` apenas como pista, não prova de internet. Se offline, exibir `Sem conexão` e possibilidade de visualizar cache permitido do chat em modo somente leitura.
6. Se erro HTTP de negócio ou autenticação, **não** mostrar como cold start; renderizar erro específico. `ready` pode indicar dependências indisponíveis; não tratar HTTP 200 falso como pronto.
7. Socket.IO reconecta com token renovado após a API voltar, reinscreve rooms autorizadas, recupera histórico perdido do Firestore, restaura inscrições e revalida chamadas. Não tentar recuperar chamada WebRTC encerrada como se fosse contínua sem renegociação/usuário consciente.
8. Não usar `setInterval` de ping artificial para contornar políticas de suspensão do plano gratuito; reconhecer limites de Render e avaliar upgrade caso o produto precise estar sempre ativo.

**Nota factual do fornecedor:** no plano gratuito Render, inatividade de ~15 minutos pode suspender serviço; voltar pode demorar na ordem de um minuto. Mensagens WebSocket recebidas também contam como atividade. Cold start torna chamadas/chats com primeira conexão potencialmente lentos. A tela é proteção de UX, não remove a latência real, e chamadas persistentes/tempo de resposta previsível pedem serviço sempre ativo.

### 11.2 Visual de inicialização

Cores dependentes do produto (Pay azul-profundo/glacial, Mobile claro/silver, Chat tons violeta/índigo sofisticados), mesmo componente de loading. Anel líquido refrativo com progress tracing, tipografia macia, fundo aurora abstrato animado leve, brand loader SVG independente de rede. Acessível a leitores de tela, `aria-live` para mudança de status, reduz animação quando solicitado, sem carga GPU excessiva.

## 12. CLOUDINARY — ORGANIZAÇÃO E SEGURANÇA

Estrutura lógica de pastas, com identificadores internos e sem dados confidenciais desnecessários:

```text
nexa/public/brand/
nexa/public/mobile-scenes/
nexa/profiles/{uid}/
nexa/chat/{conversationId}/images/
nexa/chat/{conversationId}/video/
nexa/chat/{conversationId}/audio/
nexa/chat/{conversationId}/files/
```

Tratar `public_id` como **identificador de asset, não como autorização**. Para cada upload:

1. Validar Firebase ID Token, membership da conversa e entitlement.
2. Validar MIME real, limite de bytes e extensão, tipo de mídia e quota.
3. Criar autorização de upload curta e restrita ou upload por streaming no backend; assinar com segredo no backend e limitar transformações/caminho.
4. Verificar callback/metadata após upload e gravar documento Firestore `attachments` somente quando confirmado.
5. Gerar thumbs/transformações responsivas; mídia privada entregue por URL protegida ou backend/gateway autorizado, com TTL/assinatura conforme mecanismo específico.
6. Ter limpeza de assets órfãos e exclusão consistente quando a mensagem for apagada e política permitir.
7. Não carregar vídeo/imagens full resolution no chat list. Usar CDN transformada, lazy loading e cache compatível com privacidade.

## 13. DESEMPENHO E CUSTOS

Meta: interface fluida no celular intermediário, carregamento inicial rápido e chat responsivo com Render ativo. Estabelecer budgets mensuráveis em `PERFORMANCE.md`:

- Não carregar GSAP/cena 3D pesada nas rotas do Chat e Pay quando não utilizadas.
- Lighthouse e Web Vitals em mobile e desktop; medir LCP/CLS/INP, scripts, transfer bytes e jank.
- Lista de chats virtualizada quando necessário; mensagens paginadas; subscriptions Firestore/Socket limpas em desmontagem e desconexão.
- Escritas consolidadas para recibos/estado de leitura, sem documento por tecla digitada.
- Reduzir transformações Cloudinary desnecessárias e limitar assets; acompanhar limites de plano do Firestore, Cloudinary, Render e Vercel.
- Conexões Socket.IO resilientes a auto-restart; planejar adapter compartilhado como Redis ao adicionar instâncias, mas não introduzir Redis sem necessidade inicial.
- Vídeo chamadas: TURN custa banda e pode não ser gratuito; apresentar a dependência em `DEPLOYMENT.md`, mesmo que voz/vídeo funcionem localmente em redes simples sem TURN.
- Quotas e alertas operacionais de uso, upload e mensagens para impedir custo inesperado.

## 14. DESIGN POR SITE — IDENTIDADE VISUAL COERENTE

**Pay:** estilo banco high-end: base navy/azul profundo, tipografia branca com detalhes gelo, grandes números de saldo, glass dock limpo, cartões generosos, gráficos discretos baseados em extrato real, transições de dinheiro fictício com sofisticação e zero gamificação enganosa.

**Mobile:** identidade branca/prata/perolada com acentos azul/índigo; heróis cinematográficos, 3D sutil, scroll scenes narrativas, tipografia grande, respiros amplos, menu flutuante e vitrines com hover magnético controlado. Maior investimento visual.

**Chat:** base clara com acentos malva/índigo, interface neutra para preservar a leitura, glass aplicado em cabeçalho, composer, dock, controles de chamada, modais e menus. Balões legíveis, diferenciação de mensagens próprias e recebidas, tema escuro extremamente bem resolvido.

Criar manual de tokens (cores semânticas, tipografia, escalas, radii, shadows, blur, opacidade, springs, timing). Não usar cinza de placeholder em produção sem contraste; não copiar telas de WhatsApp/Telegram/Apple literalmente. Implementar logo NEXA original SVG e variantes Pay/Mobile/Chat.

## 15. ADMINISTRAÇÃO, OPERAÇÕES E SUPORTE

Sem construir um quarto site comercial obrigatório, adicionar **módulo administrativo protegido** no backend e, se útil, `apps/admin` somente como ferramenta interna com acesso por allowlist de UIDs e roles atribuídos no servidor.

Administração deve gerenciar catálogo, preço dos números virtuais, estoque, reservas expiradas, pedidos, reconciliação, denúncias, bloqueios, quotas, feature flags e métricas agregadas. Nunca autorizar admin por boolean `isAdmin` vindo da UI/Firestore alterável pelo usuário. Registrar audit logs e exigir confirmação para ações destrutivas.

Suporte: formulário para tickets com contexto mínimo, perguntas comuns, erros compreensíveis e identificador de transação sem divulgar segredo.

## 16. NOTAS SOBRE SEGURANÇA E CRIPTOGRAFIA

- HTTPS/TLS entre browsers, Vercel, Render, Firebase e Cloudinary.
- Credenciais TURN temporárias quando puder emitir de modo seguro; segredo TURN fixo **não** vai ao browser.
- JWT Firebase verificado para HTTP/Socket; sessões/identidade substituíveis ao vencer, listener `onAuthStateChanged`, validação de refresh.
- Auditoria de token único checkout com `hash(token)` no Firestore, comparação segura conforme implementação, expiração curta e invalidação após uso.
- Idempotência por operação de pagamento/compra e mensagem; nenhuma cobrança dupla após retry.
- Nenhuma URL direta de mídia privada aberta para não participantes.
- Logs sem conteúdo de mensagem por padrão, sem gravação de voz/vídeo e sem leaks de credenciais.
- `security.txt`, política de privacidade e termos de demonstração quando publicar publicamente.
- Plano de backup/exportação de Firestore compatível com orçamento, restauração testada em ambiente separado, operação de limpeza de dados.

## 17. TESTES AUTOMATIZADOS — CRITÉRIOS OBRIGATÓRIOS

Testes unitários, integração Firebase Emulator Suite, e2e de frontend/browser (Playwright), socket e chamadas browser mocks / testes manuais com dois dispositivos.

**Pay e compras:** saldo inicial 30000 centavos, concessão única por wallet, débito exato, pagamento idempotente, transferência sem saldo, corrida com duas compras, compra disputada de mesmo número, checkout expirado, manipulação de preço, tentativa de uso por `uid` diferente, pagamento duplicado, pedido pago e app fechado antes do retorno, reparação de estado parcial.

**Auth:** login Google, guest session, refresh token, token ausente/vencido, não permitir usuário A ver pedidos de B, números A ativados por B, mensagem sem membership, upload em conversa de terceiros, admin falsificado.

**Chat:** criar conta, selecionar número, persistência após logout/login, adicionar contato, bloquear, mensagens 1:1 com dois navegadores, scroll/paginação, ACK/retry sem duplicatas, grupo e roles, mídia autorizada, preview, áudio, reconexão Socket.IO e replay, notificações, estados online com TTL.

**Calls:** permissões câmera/microfone, chamada bem-sucedida entre dois browsers com signaling, rejeitada, perdida, desconexão, múltiplos dispositivos, ICE failure, ausência de TURN e feedback honesto ao usuário, limpeza de tracks após terminar chamada.

**Visual:** screenshot tests responsive mobile 360px/390px/430px, tablet e desktop, dark/light, teclado virtual, menus, focus visible, reduced motion, boa legibilidade sobre fundos complexos, sem overflow/hidratação quebrada.

**Infra:** build dos 4 apps, lint, typecheck, testes CI, variáveis faltantes com erro explícito, deploy Vercel/Render documentado, health check verdadeiro, carregamento durante cold start, reconexão após restart e verificação de state.

Sem conclusão da fase se funcionalidades críticas não foram verificadas com dados persistidos e duas sessões distintas.

## 18. PLANO DE IMPLEMENTAÇÃO POR FASES

**Fase 0 — Engenharia do projeto:** inspeção do repo, docs, arquitetura, risks, design tokens, monorepo, scripts, CI e emuladores. Criar primeiro `CHECKLIST.md` e `PROGRESSO.md`.

**Fase 1 — Fundação backend + Firebase:** auth, admin SDK, Zod, middleware, Firestore schema/rules/indexes, API health, errors, logs, segurança básica e mocks de infraestrutura. Deploy de backend de teste no Render.

**Fase 2 — Design system Liquid Glass:** componentes reais, docs, temas, biblioteca motion, states e fallback accessible. Storybook opcional se custo justificar. Não começar marketing cinematográfico antes de sistema visual robusto.

**Fase 3 — NEXA Pay completo:** guest wallet, concessão 300, extrato, transferências fictícias, comprovantes, backend de ledger, testes de race/idempotência. Frontend Pay na Vercel.

**Fase 4 — NEXA Mobile funcional:** Google login, catálogo de números, pedidos, checkout com NEXA Pay, provisionamento atômico, Dashboard, meus números, estados e testes. Frontend Mobile na Vercel.

**Fase 5 — Landing cinematográfica da Mobile:** mockup 3D original e animações scroll-linked com progress, frames responsivos, seções de marketing, acessibilidade e otimização avançada. Esta fase não deve quebrar checkout funcional da Fase 4.

**Fase 6 — NEXA Chat MVP persistente:** ativação por número e ownership, perfil, contatos, conversas 1:1, mensagens Socket.IO + Firestore, estados persistentes, typing, recibos, offline/reconnect, chat mobile+desktop.

**Fase 7 — Chat avançado:** grupos, busca, respostas, reações, editar/excluir, mídia privada Cloudinary, áudio gravado, favorito/arquivar/bloquear/denunciar, settings completos.

**Fase 8 — Chamadas:** WebRTC 1:1 de voz, vídeo, permissões, signaling seguro, TURN e UI premium; histórico, erros e testes reais em redes diferentes. Grupo apenas com SFU quando infraestrutura configurada.

**Fase 9 — Notificações, polimento e acessibilidade:** Web Push se configurado, microinterações, desempenho, E2E, segurança, uso em mobile e dark mode.

**Fase 10 — Deploy e auditoria final:** Vercel 3 projetos, Render 1 web service, Firebase e Cloudinary configurados, regras aplicadas, domínios autorizados, restore/backup, documentação, avaliação de custo, checklist sem pendências críticas.

**Em cada fase:** mostrar implementação executada e evidência real de testes; não marcar como `concluído` só porque arquivos foram criados. Se chaves reais faltarem, marcar `Aguardando configuração externa` e manter infraestrutura testável por emuladores.

## 19. FLUXOS VISUAIS COM CRITÉRIOS DE ACEITAÇÃO

### Fluxo A: Primeiro visitante do Pay

Acessa Pay -> vê informação `Simulação` -> guest wallet é criada uma vez -> saldo mostra R$300 -> atualiza página -> preserva saldo -> faz Pix interno fictício válido -> saldo baixa conforme debit real -> extrato registra exatamente uma saída e entrada correspondente na wallet de destino.

### Fluxo B: Primeira compra de número

Mobile -> landing rápida -> Google login -> catálogo -> reserva número livre -> checkout seguro -> Pay visitante mostra saldo e resumo -> confirma -> Pay debita somente uma vez -> volta -> Mobile valida pedido via API -> número aparece em `Meus números` -> não disponível para mais ninguém.

### Fluxo C: Entrada no chat

Chat -> digita o número comprado -> autentica Google -> backend confirma ownership -> onboarding mostra foto/nome/bio -> finaliza -> vê home com estado vazio -> adiciona outro usuário pelo número virtual -> troca mensagens em dois navegadores -> recarrega ambos -> histórico aparece corretamente.

### Fluxo D: Compartilhamento e chamadas

Na conversa -> foto sobe somente com autorização, não vazando para outros usuários -> destinatário recebe via Socket.IO e pode abrir se membro -> usuário A inicia voz -> B recebe convite dentro da aplicação -> aceita -> WebRTC conecta e audio funciona (TURN configurado conforme rede) -> ambos terminam -> histórico da chamada salvo; repetir com câmera.

### Fluxo E: Render acordando

Render suspenso/inacessível -> usuário abre Chat ou Pay -> frontend já renderiza branding e exibe ligação em andamento -> após timeout, tela de `Conectando ao servidor` e retries -> API pronta -> reconexão -> consulta pendências no Firestore -> mensagem anterior não é perdida e não é duplicada.

## 20. FORMATO OBRIGATÓRIO DO RELATÓRIO DE CADA FASE

Sempre responder ao término de uma fase com:

1. **O que foi realmente implementado:** arquivos, rotas, comportamentos e integrações.
2. **Testes executados:** comandos e resultados; falhas e cobertura.
3. **Como testar agora:** URLs locais e caminho do usuário, incluindo credenciais fictícias de teste **não secretas** se necessário.
4. **Dependências externas:** quais variáveis, serviços e passos faltam ao proprietário.
5. **Riscos ainda presentes:** segurança, performance, recursos de mídia e limites de plano.
6. **Próxima fase recomendada:** tarefa delimitada, conforme `CHECKLIST.md`.

Atualizar `PROGRESSO.md` com data e commit hash se Git estiver disponível; escrever alterações de forma recuperável para outro agente retomar.

## 21. ARQUIVO `.env.example` E CONFIGURAÇÃO

Fornecer exemplos **sem valores secretos** para:

```dotenv
# Frontends - apenas valores públicos
VITE_API_BASE_URL=
VITE_SOCKET_URL=
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_VAPID_PUBLIC_KEY=
VITE_CLOUDINARY_CLOUD_NAME=

# Backend - nunca usar VITE_* para secrets
NODE_ENV=development
PORT=10000
FRONTEND_PAY_ORIGIN=
FRONTEND_MOBILE_ORIGIN=
FRONTEND_CHAT_ORIGIN=
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
TURN_SERVER_URL=
TURN_SHARED_SECRET=
LOG_LEVEL=info
```

Documentar quais variáveis são opcionais, formas seguras de configurar Firebase Admin SDK no Render, escaping da private key (newline), valores de dev/emulador, cloud_name público, VAPID, credenciais TURN temporárias e como validar integração sem registrar valores nos logs. Evitar chaves duplicadas e permitir configuração por projeto Vercel. O conjunto acima é ponto de partida, adicione variáveis quando a implementação justificar. **Nunca pedir ao usuário colar secrets num chat público ou commitar `.env`.**

## 22. CRITÉRIOS DE ENTREGA E QUALIDADE FINAL

O sistema só está completo quando:

- Os **três sites funcionam** separadamente e de maneira integrada; não são apenas mockups.
- O Pay credita R$300 de forma individualizada, persiste extrato, paga pedido NEXA e registra comprovantes, sempre em créditos fictícios.
- A Mobile permite login Google, catálogo real no Firestore, compra, gestão de número e integração com chat.
- O Chat verifica propriedade de número comprado, restaura dados em qualquer novo login Google autorizado, envia mensagens em tempo real e persiste histórico; mídia, áudio e chamadas funcionam conforme infraestrutura configurada e testes registrados.
- Nenhuma compra é duplicada por clique/retry, nenhum número pertence simultaneamente a dois `uid`s e nenhuma mensagem privada pode ser lida por pessoa não participante.
- O Render cold start tem UX própria e o estado de chat/checkout se recupera após reconexão.
- Todas as animações carregam sem impedir usabilidade, possuem alternativa reduced-motion e foram testadas em mobile e desktop.
- Rules Firestore, middleware HTTP, guards Socket.IO e downloads Cloudinary passam testes de autorização.
- Deploy tem README passo a passo, `.env.example`, scripts de start/build e CI, sem secrets no repositório.
- Chat e operadora nunca apresentam uma linha NEXA como número de telefone real. Nenhum usuário confunde pagamento com Pix oficial devido a sinalização clara de simulação.

**Comando final:** comece pela **Fase 0**, produza a estrutura base, documentação e checklist, e siga sequencialmente sem ignorar dependências. Antes de qualquer UI volumosa, consolide a arquitetura e os contratos entre Pay, Mobile e Chat. Ao longo do desenvolvimento, trate este documento como fonte de requisitos e explique desvios técnicos. Não simplifique exigências de segurança e não maquie partes não implementadas.

---

**FIM DO PROMPT MESTRE — NEXA ECOSYSTEM.**
