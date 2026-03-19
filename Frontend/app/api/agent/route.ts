import { NextResponse } from 'next/server';
import { fetchAgentOnChain, fetchReputationOnChain } from '@/lib/blockchain';

export const dynamic = 'force-dynamic';

const TIMEOUT_MS = 3000;

function parseAgentId(raw: string | null): bigint | null {
  if (!raw) return null;
  if (!/^\d+$/.test(raw)) return null;
  try {
    return BigInt(raw);
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const rawId = searchParams.get('id');
  const agentId = parseAgentId(rawId);

  if (agentId === null) {
    return NextResponse.json(
      { error: 'Invalid agent ID: must be a non-negative integer', provided: rawId },
      { status: 400 },
    );
  }

  try {
    const [agent, reputation] = await Promise.all([
      Promise.race([
        fetchAgentOnChain(agentId),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), TIMEOUT_MS)),
      ]),
      Promise.race([
        fetchReputationOnChain(agentId),
        new Promise<{ feedbackCount: number; avgScore: number }>((resolve) =>
          setTimeout(() => resolve({ feedbackCount: 0, avgScore: 0 }), TIMEOUT_MS),
        ),
      ]),
    ]);

    if (!agent) {
      return NextResponse.json({
        agentId: agentId.toString(),
        owner: '0x2962B9266a48E8F83c583caD27Be093f231781b8',
        wallet: '0x2962B9266a48E8F83c583caD27Be093f231781b8',
        uri: 'ipfs://QmDemo',
        reputation:
          reputation && reputation.feedbackCount > 0
            ? reputation
            : { feedbackCount: 42, avgScore: 4.8 },
        mockData: true,
        error: 'On-chain fetch timed out or agent not found; showing mock data',
      });
    }

    return NextResponse.json({
      agentId: agent.agentId,
      owner: agent.owner,
      wallet: agent.wallet,
      uri: agent.uri,
      reputation,
    });
  } catch (error) {
    return NextResponse.json({
      agentId: agentId.toString(),
      owner: '0x2962B9266a48E8F83c583caD27Be093f231781b8',
      wallet: '0x2962B9266a48E8F83c583caD27Be093f231781b8',
      uri: 'ipfs://QmDemo',
      reputation: { feedbackCount: 42, avgScore: 4.8 },
      mockData: true,
      error: error instanceof Error ? error.message : 'Unknown blockchain error',
    });
  }
}
