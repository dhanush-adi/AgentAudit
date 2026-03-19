import { describe, it, expect, vi, beforeEach } from 'vitest';
import express from 'express';
import request from 'supertest';
import { agentAudit } from '../index';

vi.mock('../x402', () => ({
  verifyPayment: vi.fn(),
  settlePayment: vi.fn().mockResolvedValue(undefined),
  build402Response: vi.fn((price, address, resource, network) => ({
    x402Version: 1,
    error: 'Payment required',
    accepts: [{ scheme: 'exact', maxAmountRequired: price, payTo: address }],
  })),
}));

vi.mock('../logger', () => ({
  logCall: vi.fn().mockResolvedValue(undefined),
}));

import { verifyPayment, settlePayment } from '../x402';
import { logCall } from '../logger';

const mockConfig = {
  price: '0.001',
  agentId: '1',
  network: 'goat-testnet' as const,
  receivingAddress: '0x2962B9266a48E8F83c583caD27Be093f231781b8' as `0x${string}`,
  logCalls: true,
};

function createApp(configOverrides = {}) {
  const app = express();
  app.use(express.json());
  app.use(agentAudit({ ...mockConfig, ...configOverrides }));
  app.get('/test', (_req, res) => {
    res.json({ ok: true });
  });
  return app;
}

describe('agentAudit middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 402 when no payment header is present', async () => {
    const app = createApp();
    const res = await request(app).get('/test');

    expect(res.status).toBe(402);
    expect(res.body.error).toBe('Payment required');
    expect(res.body.accepts).toHaveLength(1);
    expect(res.body.accepts[0].payTo).toBe(mockConfig.receivingAddress);
  });

  it('should reject invalid payment and return 402', async () => {
    vi.mocked(verifyPayment).mockResolvedValueOnce({
      valid: false,
      error: 'Invalid signature',
      caller: '0xCALLER',
    });

    const app = createApp();
    const res = await request(app)
      .get('/test')
      .set('x-payment', 'invalid-payment-header');

    expect(res.status).toBe(402);
    expect(res.body.error).toBe('Invalid signature');
    expect(logCall).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'rejected', agent_id: '1' }),
      undefined,
    );
  });

  it('should allow valid payment and call next()', async () => {
    vi.mocked(verifyPayment).mockResolvedValueOnce({
      valid: true,
      txHash: '0xTXHASH',
      caller: '0xCALLER',
    });

    const app = createApp();
    const res = await request(app)
      .get('/test')
      .set('x-payment', 'valid-payment-header');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
    expect(settlePayment).toHaveBeenCalledWith(
      'valid-payment-header',
      expect.stringContaining('/test'),
    );
  });

  it('should call onPaymentSuccess callback on valid payment', async () => {
    const onPaymentSuccess = vi.fn();
    vi.mocked(verifyPayment).mockResolvedValueOnce({
      valid: true,
      txHash: '0xTXHASH',
      caller: '0xCALLER',
    });

    const app = createApp({ onPaymentSuccess });
    await request(app)
      .get('/test')
      .set('x-payment', 'valid-payment-header');

    expect(onPaymentSuccess).toHaveBeenCalledWith('0xTXHASH', '0xCALLER', '0.001');
  });

  it('should call onPaymentFail callback on invalid payment', async () => {
    const onPaymentFail = vi.fn();
    vi.mocked(verifyPayment).mockResolvedValueOnce({
      valid: false,
      error: 'Insufficient funds',
      caller: '0xCALLER',
    });

    const app = createApp({ onPaymentFail });
    await request(app)
      .get('/test')
      .set('x-payment', 'bad-payment');

    expect(onPaymentFail).toHaveBeenCalledWith('Insufficient funds', '0xCALLER');
  });

  it('should skip logging when logCalls is false', async () => {
    vi.mocked(verifyPayment).mockResolvedValueOnce({
      valid: false,
      error: 'failed',
    });

    const app = createApp({ logCalls: false });
    await request(app)
      .get('/test')
      .set('x-payment', 'x');

    expect(logCall).not.toHaveBeenCalled();
  });
});
