import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { verifyPayment, settlePayment, build402Response } from '../x402';

describe('x402', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
    globalThis.fetch = originalFetch;
  });

  describe('verifyPayment', () => {
    it('should return valid when facilitator confirms payment', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          isValid: true,
          txHash: '0xABC',
          buyerAddress: '0xBUYER',
        }),
      } as Response);

      const result = await verifyPayment('payment-header', 'https://api.test/resource');

      expect(result.valid).toBe(true);
      expect(result.txHash).toBe('0xABC');
      expect(result.caller).toBe('0xBUYER');
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/verify'),
        expect.objectContaining({ method: 'POST' }),
      );
    });

    it('should return invalid with reason when facilitator rejects', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          isValid: false,
          invalidReason: 'Insufficient amount',
        }),
      } as Response);

      const result = await verifyPayment('bad-header', 'https://api.test/resource');

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Insufficient amount');
    });

    it('should return error on network failure', async () => {
      vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));

      const result = await verifyPayment('header', 'https://api.test/resource');

      expect(result.valid).toBe(false);
      expect(result.error).toContain('Payment verification failed');
      expect(result.error).toContain('Network error');
    });

    it('should return error on non-OK facilitator response', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 503,
        text: async () => 'Service Unavailable',
      } as Response);

      const result = await verifyPayment('header', 'https://api.test/resource');

      expect(result.valid).toBe(false);
      expect(result.error).toContain('503');
      expect(result.error).toContain('Service Unavailable');
    });
  });

  describe('settlePayment', () => {
    it('should POST to facilitator settle endpoint', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({ ok: true } as Response);

      await settlePayment('payment-header', 'https://api.test/resource');

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/settle'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    });

    it('should not throw on settlement failure', async () => {
      vi.mocked(fetch).mockRejectedValueOnce(new Error('timeout'));

      await expect(settlePayment('header', 'resource')).resolves.not.toThrow();
    });

    it('should log error on non-OK settlement response', async () => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 409,
        text: async () => 'Already settled',
      } as Response);

      await settlePayment('header', 'resource');

      expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('409'));
      errorSpy.mockRestore();
    });
  });

  describe('build402Response', () => {
    it('should build correct 402 response for base network', () => {
      const response = build402Response('0.01', '0xPAYTO', 'https://api.test/analyze', 'base');

      expect(response.x402Version).toBe(1);
      expect(response.error).toBe('Payment required');
      expect(response.accepts[0].network).toBe('eip155:8453');
      expect(response.accepts[0].maxAmountRequired).toBe('10000');
      expect(response.accepts[0].payTo).toBe('0xPAYTO');
    });

    it('should build correct 402 response for goat-testnet', () => {
      const response = build402Response(
        '0.001',
        '0xPAYTO',
        'https://api.test/analyze',
        'goat-testnet',
      );

      expect(response.accepts[0].network).toBe('eip155:48816');
      expect(response.accepts[0].maxAmountRequired).toBe('1000');
    });

    it('should build correct 402 response for base-sepolia', () => {
      const response = build402Response(
        '1.5',
        '0xPAYTO',
        'https://api.test/analyze',
        'base-sepolia',
      );

      expect(response.accepts[0].network).toBe('eip155:84532');
      expect(response.accepts[0].maxAmountRequired).toBe('1500000');
    });

    it('should use correct USDC asset address for each network', () => {
      const base = build402Response('0.001', '0xPAYTO', 'resource', 'base');
      const goat = build402Response('0.001', '0xPAYTO', 'resource', 'goat-testnet');
      const sepolia = build402Response('0.001', '0xPAYTO', 'resource', 'base-sepolia');

      expect(base.accepts[0].asset).toBe('0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913');
      expect(goat.accepts[0].asset).toBe('0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913');
      expect(sepolia.accepts[0].asset).toBe('0x036CbD53842c5426634e7929541eC2318f3dCF7e');
    });

    it('should include USDC extra data', () => {
      const response = build402Response('0.001', '0xPAYTO', 'resource', 'base');

      expect(response.accepts[0].extra).toEqual({ name: 'USDC', version: '2' });
    });
  });
});
