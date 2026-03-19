"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.agentAudit = agentAudit;
const crypto_1 = require("crypto");
const x402_1 = require("./x402");
const logger_1 = require("./logger");
__exportStar(require("./types"), exports);
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
function agentAudit(config) {
    return async (req, res, next) => {
        const requestId = (0, crypto_1.randomUUID)();
        const paymentHeader = req.headers['x-payment'];
        const resource = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
        // Attach request ID for downstream tracing
        req.requestId = requestId;
        if (!paymentHeader) {
            const response402 = (0, x402_1.build402Response)(config.price, config.receivingAddress, resource, config.network);
            return res.status(402).json(response402);
        }
        const startTime = Date.now();
        const { valid, error, txHash, caller } = await (0, x402_1.verifyPayment)(paymentHeader, resource);
        if (!valid) {
            const log = {
                agent_id: config.agentId,
                caller_address: caller || 'unknown',
                endpoint: req.originalUrl,
                amount_usdc: config.price,
                tx_hash: txHash || null,
                status: 'rejected',
                latency_ms: Date.now() - startTime,
                payment_payload: { header: paymentHeader, error, requestId },
            };
            if (config.logCalls !== false) {
                (0, logger_1.logCall)(log, config.dashboardWebhook);
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
                // Fire and forget settlement with retry
                settleWithRetry(paymentHeader, resource, requestId);
                const log = {
                    agent_id: config.agentId,
                    caller_address: caller || 'unknown',
                    endpoint: req.originalUrl,
                    amount_usdc: config.price,
                    tx_hash: txHash || null,
                    status: 'verified',
                    latency_ms: Date.now() - startTime,
                    payment_payload: { header: paymentHeader, requestId },
                };
                if (config.logCalls !== false) {
                    (0, logger_1.logCall)(log, config.dashboardWebhook);
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
/**
 * Settle a payment with exponential backoff retry (max 3 attempts).
 */
async function settleWithRetry(paymentHeader, resource, requestId, attempt = 1) {
    try {
        await (0, x402_1.settlePayment)(paymentHeader, resource);
    }
    catch (error) {
        if (attempt < 3) {
            const delay = Math.min(1000 * 2 ** (attempt - 1), 5000);
            console.warn(`AgentAudit [${requestId}]: Settlement attempt ${attempt} failed, retrying in ${delay}ms`);
            setTimeout(() => settleWithRetry(paymentHeader, resource, requestId, attempt + 1), delay);
        }
        else {
            console.error(`AgentAudit [${requestId}]: Settlement failed after ${attempt} attempts`, error);
        }
    }
}
