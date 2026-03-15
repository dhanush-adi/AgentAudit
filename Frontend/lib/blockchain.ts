// ============================================================
// AgentAudit — viem read-only client for GOAT Testnet3
// ============================================================
import { createPublicClient, http } from 'viem';
import { GOAT_TESTNET, CONTRACTS } from './config';
import { AGENT_REGISTRY_ABI, REPUTATION_REGISTRY_ABI } from './contracts';

const goatTestnet3 = {
  id: GOAT_TESTNET.id,
  name: GOAT_TESTNET.name,
  nativeCurrency: { name: 'Bitcoin', symbol: 'BTC', decimals: 18 },
  rpcUrls: { default: { http: [GOAT_TESTNET.rpcUrl] } },
};

export const publicClient = createPublicClient({
  chain: goatTestnet3 as any,
  transport: http(GOAT_TESTNET.rpcUrl),
});

export async function fetchAgentOnChain(agentId: bigint) {
  try {
    const [owner, wallet, uri] = await Promise.all([
      publicClient.readContract({
        address: CONTRACTS.agentRegistry,
        abi: AGENT_REGISTRY_ABI,
        functionName: 'ownerOf',
        args: [agentId],
      }),
      publicClient.readContract({
        address: CONTRACTS.agentRegistry,
        abi: AGENT_REGISTRY_ABI,
        functionName: 'getAgentWallet',
        args: [agentId],
      }),
      publicClient.readContract({
        address: CONTRACTS.agentRegistry,
        abi: AGENT_REGISTRY_ABI,
        functionName: 'tokenURI',
        args: [agentId],
      }),
    ]);
    return { owner, wallet, uri, agentId: agentId.toString() };
  } catch {
    return null;
  }
}

export async function fetchReputationOnChain(agentId: bigint) {
  try {
    const result = await publicClient.readContract({
      address: CONTRACTS.reputationRegistry,
      abi: REPUTATION_REGISTRY_ABI,
      functionName: 'getReputation',
      args: [agentId],
    });
    const [feedbackCount, totalScore] = result as [bigint, bigint, bigint];
    const avgScore = feedbackCount > 0n ? Number(totalScore) / Number(feedbackCount) : 0;
    return { feedbackCount: Number(feedbackCount), avgScore };
  } catch {
    return { feedbackCount: 0, avgScore: 0 };
  }
}
