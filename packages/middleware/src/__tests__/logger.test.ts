import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { logCall } from '../logger';
import type { CallLog } from '../types';

const mockLog: CallLog = {
  agent_id: '1',
  caller_address: '0xCALLER',
  endpoint: '/analyze',
  amount_usdc: '0.001',
  tx_hash: '0xTXHASH',
  status: 'verified',
  latency_ms: 42,
  payment_payload: { header: 'mock-payment-header' },
};

describe('logCall', () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should log to console with correct fields', async () => {
    await logCall(mockLog);

    expect(consoleSpy).toHaveBeenCalledTimes(1);
    const logOutput = consoleSpy.mock.calls[0][0];
    expect(logOutput).toContain('AgentAudit');
    expect(logOutput).toContain('agent=1');
    expect(logOutput).toContain('endpoint=/analyze');
    expect(logOutput).toContain('status=verified');
    expect(logOutput).toContain('latency=42ms');
  });

  it('should use correct icon for verified status', async () => {
    await logCall(mockLog);
    expect(consoleSpy.mock.calls[0][0]).toContain('✅');
  });

  it('should use correct icon for rejected status', async () => {
    await logCall({ ...mockLog, status: 'rejected' });
    expect(consoleSpy.mock.calls[0][0]).toContain('❌');
  });

  it('should use correct icon for pending status', async () => {
    await logCall({ ...mockLog, status: 'pending' });
    expect(consoleSpy.mock.calls[0][0]).toContain('⏳');
  });

  it('should POST to webhook when provided', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({ ok: true } as Response);

    await logCall(mockLog, 'https://webhook.example.com/logs');

    expect(fetchSpy).toHaveBeenCalledWith(
      'https://webhook.example.com/logs',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockLog),
      }),
    );
  });

  it('should not call webhook when no webhook is provided', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');

    await logCall(mockLog);

    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
