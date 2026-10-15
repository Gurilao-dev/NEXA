# DIRETRIZES DE SEGURANÇA E PRIVACIDADE — NEXA ECOSYSTEM

Este documento detalha o modelo de ameaças, a arquitetura de autorização, as regras do Firestore, a proteção de integridade transacional e as práticas de conformidade LGPD do ecossistema NEXA.

---

## 1. Princípios Fundamentais de Segurança

1. **Deny-by-Default:** Todas as portas, endpoints e coleções do Firestore são fechadas por padrão, liberando apenas acessos explicitamente comprovados e necessários.
2. **Autoridade Estrita do Servidor:** Nenhum cliente (browser) tem permissão de alterar diretamente dados de saldo, pedidos, posse de números ou emitir mensagens diretamente no banco. Todas as operações críticas passam pelo backend Node.js (`apps/api`) validado pelo Firebase Admin SDK.
3. **Isolamento de Origens (CORS):** Apenas os domínios homologados dos frontends (`pay.nexa.local`, `mobile.nexa.local`, `chat.nexa.local` e domínios Vercel de produção) são aceitos pelo servidor.
4. **Proteção contra Falso Rigor Bancário:** Nenhuma tela, recibo ou comunicação permite que o usuário confunda a simulação com uma instituição financeira real ou operadora celular pública. Recibos contêm carimbo indelével "SIMULADO / SEM VALOR FISCAL".

---

## 2. Matriz de Ameaças e Contramedidas

| Vetor de Ameaça | Impacto Potencial | Mecanismo de Mitigação Implementado |
| :--- | :--- | :--- |
| **Manipulação de Saldo no Cliente** | Criação ilícita de créditos fictícios | O saldo reside unicamente no Firestore e só é modificado via transações do Firebase Admin SDK no servidor. |
| **Race Condition em Compras Simultâneas** | Dois usuários comprarem o mesmo número virtual | Transação atômica no Firestore com lock otimista (`runTransaction`), checando o status `AVAILABLE` no momento da escrita. |
| **Manipulação de Preço** | Alterar o valor do pedido para R$ 0,01 | O cliente apenas envia o `numberId`. O servidor busca o preço oficial registrado na coleção de catálogo. |
| **Enumeração de Usuários e Números** | Varredura de contatos e donos de linhas | Rate limiting por IP/conta, busca apenas por número exato e respostas genéricas em caso de ausência de cadastro. |
| **Vazamento de Mídia Privada** | Acesso a fotos e áudios de conversas | Assinatura HMAC no upload via backend; URLs privadas com verificação de participação na conversa. |
| **Injeção de Mensagens / Spoofing** | Enviar mensagens em nome de outro usuário | O `senderUid` é extraído do JWT verificado no handshake do Socket.IO, nunca aceito do payload do cliente. |
| **Token Replay / Checkout Fraudulento** | Reutilização de tickets de compra | `checkoutTicket` opaco de uso único, com hash no banco, validade de 15 minutos e consumo atômico. |
| **XSS em Mensagens do Chat** | Execução de scripts via texto ou markdown | Sanitização rigorosa com DOMPurify; texto renderizado prioritariamente como string bruta segura sem `dangerouslySetInnerHTML`. |

---

## 3. Arquitetura de Regras do Firestore (`firestore.rules`)

As regras do Firestore atuam como a primeira linha de defesa contra requisições diretas de SDKs maliciosos:

- **Escritas Proibidas no Cliente:**
  - `wallets/*` e `walletLedger/*` -> `allow write: if false;` (Apenas Admin SDK no backend).
  - `orders/*` e `checkouts/*` -> `allow write: if false;` (Apenas Admin SDK no backend).
  - `numbers/*` -> `allow write: if false;` (Apenas Admin SDK no backend).
  - `auditLogs/*` -> `allow write: if false;` (Apenas Admin SDK no backend).
- **Leituras Restritas:**
  - Um usuário só pode ler seu próprio documento de perfil (`request.auth.uid == userId`).
  - Um participante só pode ler mensagens de conversas das quais é membro explícito no documento de conversa.

---

## 4. Práticas de Privacidade e LGPD

1. **Minimização de Dados (Data Minimization):**
   - Não coletamos CPF, RG ou dados bancários reais.
   - Login via Google restringe-se ao `email`, `displayName` e `photoURL` essenciais para identificação do perfil.
2. **Direito de Acesso e Exportação:**
   - Endpoint `GET /v1/me/export` compila em formato JSON portátil todos os dados vinculados ao `uid` (perfil, números, conversas e extratos).
3. **Direito ao Esquecimento / Exclusão:**
   - Endpoint `POST /v1/me/delete-account` orquestra a exclusão dos dados pessoais, desvinculação dos números virtuais e anonimização de registros no ledger para integridade contábil simulada.
4. **Sem Gravação de Chamadas:**
   - As sessões WebRTC de áudio e vídeo não são gravadas em disco ou servidores em nenhum momento.
