export interface PaymentPayload {
  header: string;
  error?: string;
  requestId?: string;
}

export interface AgentAuditConfig {
  /** Price per API call in USDC (e.g., "0.001") */
  price: string;
  /** Unique identifier for this agent */
  agentId: string;
  /** Target blockchain network */
  network: 'base' | 'base-sepolia' | 'goat-testnet';
  /** EVM address that receives micropayments */
  receivingAddress: `0x${string}`;
  /** Optional webhook URL for real-time call logging to the dashboard */
  dashboardWebhook?: string;
  /** Whether to log calls to console/webhook (default: true) */
  logCalls?: boolean;
  /** On-chain ReputationRegistry contract address (for future use) */
  reputationRegistry?: `0x${string}`;
  /** On-chain AgentRegistry contract address (for future use) */
  identityRegistry?: `0x${string}`;
  /** Callback fired after a successful payment verification and settlement */
  onPaymentSuccess?: (txHash: string, caller: string, amount: string) => void;
  /** Callback fired when payment verification fails */
  onPaymentFail?: (reason: string, caller: string) => void;
}

export interface CallLog {
  /** The agent's unique ID */
  agent_id: string;
  /** The buyer's EVM address */
  caller_address: string;
  /** The API endpoint that was called */
  endpoint: string;
  /** Price charged in USDC */
  amount_usdc: string;
  /** On-chain transaction hash, or null if rejected */
  tx_hash: string | null;
  /** Whether the payment was verified, rejected, or pending */
  status: 'verified' | 'rejected' | 'pending';
  /** End-to-end latency in milliseconds */
  latency_ms: number;
  /** Structured payment payload for debugging */
  payment_payload: PaymentPayload;
}
