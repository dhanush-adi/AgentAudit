"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyPayment = verifyPayment;
exports.settlePayment = settlePayment;
exports.build402Response = build402Response;
const FACILITATOR_URL = process.env.X402_FACILITATOR_URL || 'https://x402.org/facilitator';
async function verifyPayment(paymentHeader, resource) {
    try {
        const res = await fetch(`${FACILITATOR_URL}/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ payload: paymentHeader, resource })
        });
        const data = await res.json();
        return {
            valid: data.isValid,
            error: data.invalidReason,
            txHash: data.txHash,
            caller: data.buyerAddress // Assuming facilitator returns buyerAddress
        };
    }
    catch (error) {
        return { valid: false, error: error.message };
    }
}
async function settlePayment(paymentHeader, resource) {
    try {
        await fetch(`${FACILITATOR_URL}/settle`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ payload: paymentHeader, resource })
        });
    }
    catch (error) {
        console.error('AgentAudit: Failed to settle payment', error);
    }
}
function build402Response(price, receivingAddress, resource, network) {
    const amountInMicroUSDC = Math.round(parseFloat(price) * 1_000_000).toString();
    const networkId = network === 'base' ? 'eip155:8453' :
        network === 'goat-testnet' ? 'eip155:48816' :
            'eip155:84532';
    return {
        x402Version: 1,
        error: 'Payment required',
        accepts: [{
                scheme: 'exact',
                network: networkId,
                maxAmountRequired: amountInMicroUSDC,
                resource,
                description: 'AgentAudit: pay-per-call AI agent API',
                mimeType: 'application/json',
                payTo: receivingAddress,
                maxTimeoutSeconds: 300,
                asset: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // USDC on Base
                extra: { name: 'USDC', version: '2' }
            }]
    };
}
