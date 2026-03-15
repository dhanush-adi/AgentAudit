// Frontend/app/api/calls/route.ts
// Fetches recent API call logs from the running demo-agent
import { NextResponse } from 'next/server';
import { AGENT_API_URL } from '@/lib/config';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const res = await fetch(`${AGENT_API_URL}/logs`, {
      next: { revalidate: 0 },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) throw new Error('agent offline');
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    // Return empty logs if the agent is not running locally
    return NextResponse.json({ logs: [], status: 'agent_offline' });
  }
}
