// Frontend/app/api/agent/route.ts
// Reads agent 1 from the GOAT Network on-chain registry
import { NextResponse } from 'next/server';
import { fetchAgentOnChain, fetchReputationOnChain } from '@/lib/blockchain';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const agentId = BigInt(searchParams.get('id') ?? '1');

  const [agent, reputation] = await Promise.all([
    fetchAgentOnChain(agentId),
    fetchReputationOnChain(agentId),
  ]);

  if (!agent) {
    return NextResponse.json({ error: 'Agent not found on-chain' }, { status: 404 });
  }

  return NextResponse.json({
    agentId: agent.agentId,
    owner: agent.owner,
    wallet: agent.wallet,
    uri: agent.uri,
    reputation,
  });
}
