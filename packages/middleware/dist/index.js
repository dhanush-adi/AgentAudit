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
const x402_1 = require("./x402");
const logger_1 = require("./logger");
__exportStar(require("./types"), exports);
function agentAudit(config) {
    return async (req, res, next) => {
        const paymentHeader = req.headers['x-payment'];
        const resource = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
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
                payment_payload: { header: paymentHeader, error }
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
                // Fire and forget settlement
                (0, x402_1.settlePayment)(paymentHeader, resource).catch(console.error);
                const log = {
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
