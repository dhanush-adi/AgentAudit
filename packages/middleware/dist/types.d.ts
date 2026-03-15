export interface AgentAuditConfig {
    price: string;
    agentId: string;
    network: 'base' | 'base-sepolia' | 'goat-testnet';
    receivingAddress: `0x${string}`;
    dashboardWebhook?: string;
    logCalls?: boolean;
    reputationRegistry?: `0x${string}`;
    identityRegistry?: `0x${string}`;
    onPaymentSuccess?: (txHash: string, caller: string, amount: string) => void;
    onPaymentFail?: (reason: string, caller: string) => void;
}
export interface CallLog {
    agent_id: string;
    caller_address: string;
    endpoint: string;
    amount_usdc: string;
    tx_hash: string | null;
    status: 'verified' | 'rejected' | 'pending';
    latency_ms: number;
    payment_payload: any;
}
