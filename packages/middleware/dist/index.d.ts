import { RequestHandler } from 'express';
import { AgentAuditConfig } from './types';
export * from './types';
/**
 * Creates an Express middleware that gates API endpoints behind x402 micropayments.
 *
 * The middleware intercepts incoming requests, checks for a valid `x-payment` header,
 * verifies payment with the x402 facilitator, and only calls `next()` if payment is valid.
 * After the response is sent, the payment is settled on-chain.
 *
 * @param config - AgentAudit configuration object
 * @param config.price - Price per API call in USDC (e.g., "0.001")
 * @param config.agentId - Unique identifier for this agent
 * @param config.network - Target blockchain network
 * @param config.receivingAddress - EVM address that receives micropayments
 * @param config.logCalls - Whether to log calls to console/webhook (default: true)
 * @param config.dashboardWebhook - Optional webhook URL for real-time logging
 * @param config.onPaymentSuccess - Callback fired after successful payment
 * @param config.onPaymentFail - Callback fired when payment verification fails
 * @returns Express RequestHandler middleware function
 *
 * @example
 * ```ts
 * import express from 'express';
 * import { agentAudit } from 'agentaudit';
 *
 * const app = express();
 * app.use(agentAudit({
 *   price: '0.001',
 *   agentId: 'my-agent-1',
 *   network: 'goat-testnet',
 *   receivingAddress: '0x...',
 * }));
 * app.get('/api/data', (req, res) => res.json({ result: 'paid content' }));
 * app.listen(3000);
 * ```
 */
export declare function agentAudit(config: AgentAuditConfig): RequestHandler;
