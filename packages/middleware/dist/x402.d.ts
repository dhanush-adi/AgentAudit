interface VerifyResult {
    valid: boolean;
    error?: string;
    txHash?: string;
    caller?: string;
}
/**
 * Verifies an x402 payment header against the facilitator service.
 * @param paymentHeader - The base64-encoded x402 payment payload from the `x-payment` header
 * @param resource - The full URL of the resource being accessed
 * @returns Verification result with validity status, optional tx hash, and caller address
 */
export declare function verifyPayment(paymentHeader: string, resource: string): Promise<VerifyResult>;
/**
 * Settles a verified payment with the facilitator service.
 * Called after the API response is successfully sent to the buyer.
 * @param paymentHeader - The base64-encoded x402 payment payload
 * @param resource - The full URL of the resource that was accessed
 */
export declare function settlePayment(paymentHeader: string, resource: string): Promise<void>;
/**
 * Builds the 402 Payment Required response body per the x402 protocol spec.
 * @param price - The price in USDC (e.g., "0.001")
 * @param receivingAddress - The EVM address to receive payment
 * @param resource - The full URL of the resource being gated
 * @param network - Target network: "base", "base-sepolia", or "goat-testnet"
 * @returns x402-compliant 402 response object
 */
export declare function build402Response(price: string, receivingAddress: string, resource: string, network: string): {
    x402Version: number;
    error: string;
    accepts: {
        scheme: string;
        network: string;
        maxAmountRequired: string;
        resource: string;
        description: string;
        mimeType: string;
        payTo: string;
        maxTimeoutSeconds: number;
        asset: string;
        extra: {
            name: string;
            version: string;
        };
    }[];
};
export {};
