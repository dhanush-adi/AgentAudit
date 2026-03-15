export declare function verifyPayment(paymentHeader: string, resource: string): Promise<{
    valid: boolean;
    error?: string;
    txHash?: string;
    caller?: string;
}>;
export declare function settlePayment(paymentHeader: string, resource: string): Promise<void>;
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
