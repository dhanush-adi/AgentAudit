-- Call logs table
create table call_logs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  agent_id text not null,
  caller_address text not null,
  endpoint text not null,
  amount_usdc numeric(18,6) not null,
  tx_hash text,
  status text check (status in ('verified', 'rejected', 'pending')) not null,
  latency_ms integer,
  payment_payload jsonb
);

-- Agents table (mirrors on-chain, for fast dashboard queries)
create table agents (
  id uuid primary key default gen_random_uuid(),
  token_id text unique not null,
  owner_address text not null,
  name text,
  description text,
  image_url text,
  agent_uri text,
  receiving_wallet text,
  registered_at timestamptz default now(),
  network text default 'base'
);

-- Enable realtime on call_logs
alter publication supabase_realtime add table call_logs;
