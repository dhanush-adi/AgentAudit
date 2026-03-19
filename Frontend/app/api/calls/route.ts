import { NextResponse } from 'next/server';
import { AGENT_API_URL } from '@/lib/config';

export const dynamic = 'force-dynamic';

// Simple in-memory rate limiting per IP
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 60; // 60 requests per minute

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  entry.count++;
  return entry.count > RATE_LIMIT_MAX_REQUESTS;
}

export async function GET(req: Request) {
  // Rate limit by forwarded IP or fallback
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Rate limit exceeded', logs: [], status: 'rate_limited' },
      { status: 429 },
    );
  }

  try {
    const res = await fetch(`${AGENT_API_URL}/logs`, {
      next: { revalidate: 0 },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) throw new Error('agent offline');
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({
      logs: [],
      status: 'agent_offline',
      error: error instanceof Error ? error.message : 'Agent unreachable',
    });
  }
}
