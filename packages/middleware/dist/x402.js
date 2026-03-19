"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyPayment = verifyPayment;
exports.settlePayment = settlePayment;
exports.build402Response = build402Response;
const FACILITATOR_URL = process.env.X402_FACILITATOR_URL || 'https://x402.org/facilitator';
const FACILITATOR_TIMEOUT_MS = 10_000;
/**
 * Verifies an x402 payment header against the facilitator service.
 * @param paymentHeader - The base64-encoded x402 payment payload from the `x-payment` header
 * @param resource - The full URL of the resource being accessed
 * @returns Verification result with validity status, optional tx hash, and caller address
 */
async function verifyPayment(paymentHeader, resource) {
    try {
        const res = await fetch(`${FACILITATOR_URL}/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ payload: paymentHeader, resource }),
            signal: AbortSignal.timeout(FACILITATOR_TIMEOUT_MS),
        });
        if (!res.ok) {
            const text = await res.text().catch(() => 'unknown error');
            return { valid: false, error: `AgentAudit: Facilitator returned ${res.status}: ${text}` };
        }
        const data = await res.json();
        return {
            valid: data.isValid,
            error: data.invalidReason,
            txHash: data.txHash,
            caller: data.buyerAddress,
        };
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return { valid: false, error: `AgentAudit: Payment verification failed: ${message}` };
    }
}
/**
 * Settles a verified payment with the facilitator service.
 * Called after the API response is successfully sent to the buyer.
 * @param paymentHeader - The base64-encoded x402 payment payload
 * @param resource - The full URL of the resource that was accessed
 */
async function settlePayment(paymentHeader, resource) {
    try {
        const res = await fetch(`${FACILITATOR_URL}/settle`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ payload: paymentHeader, resource }),
            signal: AbortSignal.timeout(FACILITATOR_TIMEOUT_MS),
        });
        if (!res.ok) {
            const text = await res.text().catch(() => 'unknown error');
            console.error(`AgentAudit: Settlement failed with ${res.status}: ${text}`);
        }
    }
    catch (error) {
        console.error('AgentAudit: Failed to settle payment', error);
    }
}
/**
 * Builds the 402 Payment Required response body per the x402 protocol spec.
 * @param price - The price in USDC (e.g., "0.001")
 * @param receivingAddress - The EVM address to receive payment
 * @param resource - The full URL of the resource being gated
 * @param network - Target network: "base", "base-sepolia", or "goat-testnet"
 * @returns x402-compliant 402 response object
 */
function build402Response(price, receivingAddress, resource, network) {
    const amountInMicroUSDC = Math.round(parseFloat(price) * 1_000_000).toString();
    const networkId = network === 'base'
        ? 'eip155:8453'
        : network === 'goat-testnet'
            ? 'eip155:48816'
            : 'eip155:84532';
    const assetAddress = network === 'base'
        ? '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'
        : network === 'goat-testnet'
            ? '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'
            : '0x036CbD53842c5426634e7929541eC2318f3dCF7e';
    return {
        x402Version: 1,
        error: 'Payment required',
        accepts: [
            {
                scheme: 'exact',
                network: networkId,
                maxAmountRequired: amountInMicroUSDC,
                resource,
                description: 'AgentAudit: pay-per-call AI agent API',
                mimeType: 'application/json',
                payTo: receivingAddress,
                maxTimeoutSeconds: 300,
                asset: assetAddress,
                extra: { name: 'USDC', version: '2' },
            },
        ],
    };
}
