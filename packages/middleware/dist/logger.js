"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logCall = logCall;
async function logCall(log, dashboardWebhook) {
    // Structured console logging — no external database required
    const icon = log.status === 'verified' ? '✅' : log.status === 'rejected' ? '❌' : '⏳';
    console.log(`${icon} [AgentAudit] agent=${log.agent_id} endpoint=${log.endpoint} ` +
        `amount=$${log.amount_usdc} status=${log.status} latency=${log.latency_ms}ms ` +
        `caller=${log.caller_address} tx=${log.tx_hash || 'none'}`);
    // Optional: send logs to a custom webhook endpoint
    if (dashboardWebhook) {
        await fetch(dashboardWebhook, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(log)
        }).catch(err => {
            console.error('AgentAudit: Webhook logging error', err);
        });
    }
}
