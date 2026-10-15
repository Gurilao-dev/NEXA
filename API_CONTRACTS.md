# CONTRATOS DE API E SOCKET.IO — NEXA ECOSYSTEM

Especificação formal de todas as rotas HTTP `/v1/*`, formatos de erro RFC 7807, convenções de payloads e eventos de WebSocket/Socket.IO do ecossistema NEXA.

---

## 1. Padrões e Convenções Globais

1. **Valores Monetários Fictícios:** Sempre transmitidos em **centavos inteiros** (`amountCents: number`). Exemplo: R$ 300,00 = `30000`; R$ 29,90 = `2990`. Valores decimais em ponto flutuante são estritamente rejeitados pelo validador.
2. **Timestamps:** Sempre no padrão ISO 8601 UTC (`2026-10-15T18:30:00.000Z`).
3. **Formato de Erro RFC 7807 (Problem Details):**
   ```json
   {
     "type": "https://nexa.api/errors/insufficient-balance",
     "title": "Saldo Insuficiente",
     "status": 422,
     "detail": "A carteira de demonstração possui R$ 15,00, valor insuficiente para o débito de R$ 29,90.",
     "instance": "/v1/pay/checkouts/chk_123/confirm",
     "code": "PAY_INSUFFICIENT_FUNDS",
     "requestId": "req_abc987"
   }
   ```
4. **Idempotência:** Toda operação de escrita financeira ou de provisionamento aceita o cabeçalho `Idempotency-Key: <UUIDv4>`. Se o mesmo request for repetido, a resposta anterior é retornada com o cabeçalho `X-Cache-Lookup: IDEMPOTENT_HIT`.
5. **Autenticação:** Cabeçalho padrão `Authorization: Bearer <Firebase_ID_Token>`. Para a carteira visitante do NEXA Pay, a autenticação utiliza um JWT gerado via Firebase Anonymous Auth ou token assinado de sessão emitido em `/v1/guest/session`.

---

## 2. Mapa de Endpoints REST (Fastify)

### 2.1 Saúde e Configuração Pública
- **`GET /health/live`**
  - Retorno 200: `{ "status": "ok", "uptime": 1284 }`
- **`GET /health/ready`**
  - Retorno 200: `{ "status": "ready", "database": "connected", "storage": "ready" }`
  - Retorno 503: `{ "status": "degraded", "detail": "Firestore emulator unavailable" }`
- **`GET /v1/public/config`**
  - Retorna configurações públicas (versão, moedas fictícias suportadas, recursos habilitados).

### 2.2 NEXA Pay — Carteira e Ledger de Demonstração
- **`POST /v1/guest/session`**
  - Inicializa sessão demo para novo visitante com concessão única de R$ 300,00.
  - Retorno 200: `{ "guestUid": "gst_...", "balanceCents": 30000, "token": "..." }`
- **`GET /v1/pay/wallet`**
  - Retorna saldo e resumo da carteira do visitante autenticado.
- **`GET /v1/pay/transactions?cursor=...&limit=20&type=all`**
  - Retorna extrato com histórico imutável do ledger e paginação por cursor.
- **`GET /v1/pay/transactions/:id`**
  - Retorna dados completos do comprovante com marca d'água "SIMULADO".
- **`POST /v1/pay/transfers`**
  - Realiza transferência Pix simulada entre carteiras demo por chave interna NEXA.
  - Body: `{ "recipientKey": "nexa_...", "amountCents": 1000, "description": "Café virtual" }`
- **`GET /v1/pay/checkouts/:ticket`**
  - Resolve dados públicos mínimos do checkout para o frontend do Pay (item, preço, validade).
- **`POST /v1/pay/checkouts/:id/confirm`**
  - Efetua o débito atômico na carteira visitante e liquida a compra do número virtual.
  - Body: `{ "ticket": "...", "idempotencyKey": "uuid-v4" }`

### 2.3 NEXA Mobile — Catálogo, Pedidos e Telecom Virtual
- **`GET /v1/mobile/numbers?ddd=11&pattern=gold&cursor=...`**
  - Lista catálogo de números disponíveis com status `AVAILABLE`.
- **`GET /v1/mobile/numbers/:id`**
  - Retorna detalhes de um número virtual específico.
- **`POST /v1/mobile/orders`**
  - Reserva temporária do número (15 min) e emissão de `checkoutTicket`.
  - Headers: `Authorization: Bearer <Google_JWT>`
  - Body: `{ "numberId": "num_...", "idempotencyKey": "uuid-v4" }`
  - Retorno 201: `{ "orderId": "ord_...", "checkoutTicket": "tkt_...", "expiresAt": "...", "amountCents": 2990 }`
- **`GET /v1/mobile/orders/:id`**
  - Consulta o status de um pedido (proprietário autenticado).
- **`GET /v1/mobile/me/numbers`**
  - Lista todos os números virtuais ativos de posse do usuário logado.
- **`PATCH /v1/mobile/me/primary-number`**
  - Define qual das linhas compradas é a identidade padrão para o NEXA Chat.
  - Body: `{ "numberId": "num_..." }`

### 2.4 Identidade Central
- **`GET /v1/me`**
  - Retorna perfil central (`uid`, `email`, `displayName`, `photoURL`, `primaryNumber`).
- **`PATCH /v1/me`**
  - Atualiza campos editáveis (`displayName`, `photoURL`, preferências).

### 2.5 NEXA Chat — Mensageiro e Presença
- **`POST /v1/chat/activate`**
  - Valida posse de linha virtual ativa comprada e cria o perfil de chat.
  - Body: `{ "numberId": "num_...", "displayName": "...", "about": "..." }`
- **`GET /v1/chat/conversations`**
  - Lista conversas do usuário com resumo de última mensagem e contagem não lida.
- **`POST /v1/chat/conversations`**
  - Inicia conversa 1:1 informando o número NEXA do contato.
- **`GET /v1/chat/conversations/:id/messages?cursor=...&limit=30`**
  - Busca histórico ordenado de mensagens.
- **`POST /v1/chat/conversations/:id/messages`**
  - Envio de mensagem com gravação autoritativa no Firestore antes do retorno HTTP/ACK.
- **`PATCH /v1/chat/messages/:id`**
  - Edição de mensagem dentro da janela permitida (15 minutos).
- **`DELETE /v1/chat/messages/:id`**
  - Exclusão com opção "para todos" (com tombstone) ou "para mim".
- **`POST /v1/chat/groups`**
  - Criação de novo grupo com título, avatar e membros iniciais.
- **`POST /v1/chat/groups/:id/invites`**
  - Emissão de link/token revogável de convite de grupo.

### 2.6 Mídia Cloudinary
- **`POST /v1/media/upload-authorizations`**
  - Gera assinatura criptográfica efêmera (HMAC-SHA1) para upload direto e seguro ao Cloudinary.
  - Body: `{ "conversationId": "...", "fileType": "image/webp", "fileSizeBytes": 204800 }`
- **`POST /v1/media/complete`**
  - Registra a mídia enviada no Firestore e vincula à mensagem.

### 2.7 Chamadas WebRTC
- **`POST /v1/calls`**
  - Dispara convite de chamada 1:1 e inicia sinalização.
- **`GET /v1/calls/history`**
  - Histórico de chamadas efetuadas, atendidas e perdidas.
- **`POST /v1/calls/:id/end`**
  - Finalização formal da sessão de chamada.

---

## 3. Especificação de Eventos Socket.IO

Conexões autenticadas via handshake com token Firebase:
```typescript
const socket = io("https://api.nexa.local/chat", {
  auth: { token: "Bearer <Firebase_ID_Token>" }
});
```

### 3.1 Eventos de Chat (`/chat`)
| Evento | Origem | Payload | Descrição |
| :--- | :--- | :--- | :--- |
| `message:send` | Cliente | `{ conversationId, text, clientMessageId, attachmentId? }` | Envia mensagem com id otimista |
| `message:ack` | Servidor | `{ clientMessageId, messageId, status: "sent", timestamp }` | Confirmação de persistência no Firestore |
| `message:new` | Servidor | `MessageDocument` | Difusão da nova mensagem aos membros |
| `typing:start` | Cliente | `{ conversationId }` | Inicia indicador de digitação (TTL 5s) |
| `typing:stop` | Cliente | `{ conversationId }` | Interrompe indicador de digitação |
| `receipt:read` | Cliente | `{ conversationId, messageIds: string[] }` | Notifica leitura de mensagens |
| `receipt:update` | Servidor | `{ conversationId, messageIds, status: "read", userId }` | Atualização de tique azul |

### 3.2 Eventos de Sinalização WebRTC (`/calls`)
| Evento | Origem | Payload | Descrição |
| :--- | :--- | :--- | :--- |
| `call:invite` | Cliente | `{ targetUid, callType: "audio" \| "video" }` | Inicia chamada para o destinatário |
| `call:ringing` | Servidor | `{ callId, callerUid, callerName, callType }` | Alerta recebido pelo destinatário |
| `call:accept` | Cliente | `{ callId }` | Destinatário atende a chamada |
| `call:reject` | Cliente | `{ callId, reason?: string }` | Chamada recusada ou ocupado |
| `call:offer` | Cliente | `{ callId, sdp: RTCSessionDescriptionInit }` | Envio de proposta SDP WebRTC |
| `call:answer` | Cliente | `{ callId, sdp: RTCSessionDescriptionInit }` | Envio de resposta SDP WebRTC |
| `call:ice` | Cliente | `{ callId, candidate: RTCIceCandidateInit }` | Troca de candidatos ICE |
| `call:end` | Ambos | `{ callId, durationSeconds?: number }` | Encerramento da chamada e liberação |
