// ============================================================
// AgentAudit — Central Config
// Contract addresses and network config for GOAT Network
// ============================================================

export const GOAT_TESTNET = {
  id: 48816,
  name: 'GOAT Testnet3',
  rpcUrl: process.env.GOAT_RPC_URL || 'https://rpc.testnet3.goat.network',
  explorerUrl: 'https://explorer.testnet3.goat.network',
};

export const CONTRACTS = {
  agentRegistry: (process.env.NEXT_PUBLIC_AGENT_REGISTRY ||
    '0x3de03AB80fdDDa888598303FF34E496bD29E140F') as `0x${string}`,
  reputationRegistry: (process.env.NEXT_PUBLIC_REPUTATION_REGISTRY ||
    '0x4721bEF3A4A7226E63783d6546031eCEe3D59BF0') as `0x${string}`,
  validationRegistry: (process.env.NEXT_PUBLIC_VALIDATION_REGISTRY ||
    '0x9facA0523F1CEc547CE5e00a808338bF67a46924') as `0x${string}`,
};

/** URL of the running demo-agent (update if deploying remotely) */
export const AGENT_API_URL = process.env.NEXT_PUBLIC_AGENT_API_URL || 'http://localhost:3001';
