import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { buildApp } from '../src/app.js';
import { FastifyInstance } from 'fastify';

describe('NEXA Chat API & Gatekeeping Integration', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('deve bloquear a ativação do chat se o usuário não for proprietário da linha', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/v1/chat/activate',
      headers: {
        authorization: 'Bearer mock_intruder_user',
      },
      payload: {
        numberId: 'num_inexistente',
        displayName: 'Intruso',
      },
    });

    expect(res.statusCode).toBe(404);
  });

  it('deve permitir ativação, envio de mensagens e listagem de conversas para usuário proprietário', async () => {
    const userUid = 'chat_tester_uid';
    const authHeader = `Bearer mock_${userUid}`;

    // 1. Concede saldo visitante para comprar número
    const guestRes = await app.inject({
      method: 'POST',
      url: '/v1/guest/session',
      payload: { visitorId: `vis_${userUid}` },
    });
    const { token: guestToken } = guestRes.json();

    // 2. Reserva número
    const numbersRes = await app.inject({ method: 'GET', url: '/v1/mobile/numbers' });
    const numbers = numbersRes.json().items;
    const targetNumber = numbers.find((n: any) => n.status === 'AVAILABLE') || numbers[0];

    const orderRes = await app.inject({
      method: 'POST',
      url: '/v1/mobile/orders',
      headers: { authorization: authHeader },
      payload: {
        numberId: targetNumber.numberId,
        idempotencyKey: crypto.randomUUID(),
      },
    });
    const orderData = orderRes.json();

    // 3. Liquida pedido
    const confirmRes = await app.inject({
      method: 'POST',
      url: `/v1/pay/checkouts/${orderData.orderId}/confirm`,
      headers: { authorization: `Bearer ${guestToken}` },
      payload: {
        ticket: orderData.checkoutTicket,
        idempotencyKey: crypto.randomUUID(),
      },
    });
    expect(confirmRes.statusCode).toBe(200);

    // 4. Ativa chat com o número adquirido
    const activateRes = await app.inject({
      method: 'POST',
      url: '/v1/chat/activate',
      headers: { authorization: authHeader },
      payload: {
        numberId: targetNumber.numberId,
        displayName: 'Agente NEXA Alfa',
        about: 'Canal criptografado seguro',
      },
    });

    expect(activateRes.statusCode).toBe(200);
    const profile = activateRes.json();
    expect(profile.formattedNumber).toBe(targetNumber.formatted);
    expect(profile.displayName).toBe('Agente NEXA Alfa');

    // 5. Consulta perfil
    const meRes = await app.inject({
      method: 'GET',
      url: '/v1/chat/me',
      headers: { authorization: authHeader },
    });
    expect(meRes.statusCode).toBe(200);
    expect(meRes.json().displayName).toBe('Agente NEXA Alfa');

    // 6. Cria grupo
    const groupRes = await app.inject({
      method: 'POST',
      url: '/v1/chat/groups',
      headers: { authorization: authHeader },
      payload: {
        title: 'Força-Tarefa NEXA',
        memberUids: [userUid],
      },
    });
    expect(groupRes.statusCode).toBe(201);
    const group = groupRes.json();
    expect(group.type).toBe('GROUP');
    expect(group.title).toBe('Força-Tarefa NEXA');

    // 7. Envia mensagem autoritativa no grupo
    const msgRes = await app.inject({
      method: 'POST',
      url: `/v1/chat/conversations/${group.conversationId}/messages`,
      headers: { authorization: authHeader },
      payload: {
        conversationId: group.conversationId,
        text: 'Transmissão inicial de teste no grupo',
        clientMessageId: `cmsg_${Date.now()}`,
      },
    });
    expect(msgRes.statusCode).toBe(201);
    expect(msgRes.json().status).toBe('SENT');

    // 8. Lista mensagens
    const listMsgRes = await app.inject({
      method: 'GET',
      url: `/v1/chat/conversations/${group.conversationId}/messages`,
      headers: { authorization: authHeader },
    });
    expect(listMsgRes.statusCode).toBe(200);
    expect(listMsgRes.json().total).toBe(1);
    expect(listMsgRes.json().items[0].text).toBe('Transmissão inicial de teste no grupo');
  });
});
