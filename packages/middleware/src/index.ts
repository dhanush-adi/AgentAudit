import { Request, Response, NextFunction, RequestHandler } from 'express';
import { AgentAuditConfig, CallLog } from './types';
import { verifyPayment, settlePayment, build402Response } from './x402';
import { logCallToSupabase } from './logger';

export * from './types';

export function agentAudit(config: AgentAuditConfig): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction) => {
    const paymentHeader = req.headers['x-payment'] as string;
    const resource = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
    
    if (!paymentHeader) {
      const response402 = build402Response(config.price, config.receivingAddress, resource, config.network);
      return res.status(402).json(response402);
    }
    
    const startTime = Date.now();
    
    const { valid, error, txHash, caller } = await verifyPayment(paymentHeader, resource);
    
    if (!valid) {
      const log: CallLog = {
        agent_id: config.agentId,
        caller_address: caller || 'unknown',
        endpoint: req.originalUrl,
        amount_usdc: config.price,
        tx_hash: txHash || null,
        status: 'rejected',
        latency_ms: Date.now() - startTime,
        payment_payload: { header: paymentHeader, error }
      };
      if (config.logCalls !== false) {
        logCallToSupabase(log, config.dashboardWebhook);
      }
      if (config.onPaymentFail) {
        config.onPaymentFail(error || 'Verification failed', caller || 'unknown');
      }
      return res.status(402).json({ error: error || 'Payment verification failed' });
    }
    
    const originalSend = res.send;
    let settled = false;
    
    res.send = function (body) {
      if (!settled) {
        settled = true;
        // Fire and forget settlement
        settlePayment(paymentHeader, resource).catch(console.error);
        
        const log: CallLog = {
          agent_id: config.agentId,
          caller_address: caller || 'unknown',
          endpoint: req.originalUrl,
          amount_usdc: config.price,
          tx_hash: txHash || null,
          status: 'verified',
          latency_ms: Date.now() - startTime,
          payment_payload: { header: paymentHeader }
        };
        
        if (config.logCalls !== false) {
          logCallToSupabase(log, config.dashboardWebhook);
        }
        
        if (config.onPaymentSuccess && txHash && caller) {
          config.onPaymentSuccess(txHash, caller, config.price);
        }
      }
      return originalSend.call(this, body);
    };
    
    next();
  };
}
