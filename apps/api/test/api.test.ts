import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { buildApp } from '../src/app.js';
import { FastifyInstance } from 'fastify';

describe('NEXA API — Automated Integration Test Suite', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  // 1. Health checks
  it('GET /health/live should return status ok', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/health/live',
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.status).toBe('ok');
    expect(typeof body.uptimeSeconds).toBe('number');
  });

  it('GET /health/ready should return database ready', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/health/ready',
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.status).toBe('ready');
    expect(body.database).toBe('connected');
  });

  it('GET /v1/public/config should return simulation notice and features', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/v1/public/config',
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.isSimulation).toBe(true);
    expect(body.currency).toBe('BRL');
  });

  // 2. NEXA Pay — Guest Session & Wallet
  it('POST /v1/guest/session should grant R$ 300,00 (30000 cents)', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/v1/guest/session',
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.isGuest).toBe(true);
    expect(body.balanceCents).toBe(30000);
    expect(body.token).toBeDefined();

    // Consulta carteira autenticado com o token de visitante
    const walletRes = await app.inject({
      method: 'GET',
      url: '/v1/pay/wallet',
      headers: {
        authorization: `Bearer ${body.token}`,
      },
    });
    expect(walletRes.statusCode).toBe(200);
    const wallet = JSON.parse(walletRes.body);
    expect(wallet.balanceCents).toBe(30000);
    expect(wallet.initialGrantGiven).toBe(true);
  });

  // 3. NEXA Mobile — Catalog & Order
  it('GET /v1/mobile/numbers should return virtual numbers catalog', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/v1/mobile/numbers',
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.total).toBeGreaterThan(0);
    expect(body.items[0].status).toBe('AVAILABLE');
  });

  // 4. Full Flow: Order creation -> Checkout preview -> Confirm payment -> Provisioning
  it('Complete Flow: create order, resolve ticket, pay with demo wallet, provision number', async () => {
    // A. Guest session no Pay
    const guestRes = await app.inject({
      method: 'POST',
      url: '/v1/guest/session',
    });
    const { token: guestToken } = JSON.parse(guestRes.body);

    // B. Catálogo e escolha de número
    const catalogRes = await app.inject({
      method: 'GET',
      url: '/v1/mobile/numbers',
    });
    const catalog = JSON.parse(catalogRes.body);
    const selectedNumber = catalog.items[0];

    // C. Criação de pedido na Mobile pelo usuário autenticado Google
    const userAuthHeader = 'Bearer mock_usr_test123';
    const orderRes = await app.inject({
      method: 'POST',
      url: '/v1/mobile/orders',
      headers: { authorization: userAuthHeader },
      payload: {
        numberId: selectedNumber.numberId,
        idempotencyKey: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      },
    });
    expect(orderRes.statusCode).toBe(201);
    const orderData = JSON.parse(orderRes.body);
    expect(orderData.checkoutTicket).toBeDefined();

    // D. Visualização do Checkout no Pay
    const previewRes = await app.inject({
      method: 'GET',
      url: `/v1/pay/checkouts/${orderData.checkoutTicket}`,
    });
    expect(previewRes.statusCode).toBe(200);
    const preview = JSON.parse(previewRes.body);
    expect(preview.amountCents).toBe(selectedNumber.priceCents);
    expect(preview.isSimulation).toBe(true);

    // E. Confirmação do pagamento pelo visitante no NEXA Pay
    const confirmRes = await app.inject({
      method: 'POST',
      url: `/v1/pay/checkouts/${orderData.orderId}/confirm`,
      headers: { authorization: `Bearer ${guestToken}` },
      payload: {
        ticket: orderData.checkoutTicket,
        idempotencyKey: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
      },
    });
    expect(confirmRes.statusCode).toBe(200);
    const receipt = JSON.parse(confirmRes.body);
    expect(receipt.watermark).toBe('SIMULADO / SEM VALOR FISCAL OU BANCÁRIO');
    expect(receipt.amountCents).toBe(selectedNumber.priceCents);

    // F. Valida que o saldo da carteira baixou exatamente pelo valor da compra
    const updatedWalletRes = await app.inject({
      method: 'GET',
      url: '/v1/pay/wallet',
      headers: { authorization: `Bearer ${guestToken}` },
    });
    const updatedWallet = JSON.parse(updatedWalletRes.body);
    expect(updatedWallet.balanceCents).toBe(30000 - selectedNumber.priceCents);

    // G. Valida que o número agora pertence ao usuário na Mobile
    const myNumbersRes = await app.inject({
      method: 'GET',
      url: '/v1/mobile/me/numbers',
      headers: { authorization: userAuthHeader },
    });
    expect(myNumbersRes.statusCode).toBe(200);
    const myNumbers = JSON.parse(myNumbersRes.body);
    expect(myNumbers.items.some((n: any) => n.numberId === selectedNumber.numberId)).toBe(true);

    // H. Ativação do NEXA Chat com o número adquirido
    const activateChatRes = await app.inject({
      method: 'POST',
      url: '/v1/chat/activate',
      headers: { authorization: userAuthHeader },
      payload: {
        numberId: selectedNumber.numberId,
        displayName: 'Dev NEXA',
        about: 'Testando ecossistema!',
      },
    });
    expect(activateChatRes.statusCode).toBe(200);
    const chatProfile = JSON.parse(activateChatRes.body);
    expect(chatProfile.activeNumberId).toBe(selectedNumber.numberId);
    expect(chatProfile.displayName).toBe('Dev NEXA');
  });
});
