-- Receipt database schema
-- Run this in Supabase SQL Editor

create type contract_status as enum (
  'PENDING_DELIVERY',
  'DELIVERED',
  'AGENT_EVALUATING',
  'APPROVED',
  'DISPUTED',
  'SETTLED',
  'REFUNDED'
);

create table freelancers (
  id            text primary key default gen_random_uuid()::text,
  name          text not null,
  wallet_address text unique not null,
  circle_wallet_id text unique,
  bio           text,
  avatar_color  text default '#667eea',
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

create table services (
  id            text primary key default gen_random_uuid()::text,
  slug          text unique not null,
  title         text not null,
  description   text not null,
  price_usdc    numeric not null,
  freelancer_id text references freelancers(id),
  is_active     boolean default true,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

create table contracts (
  id              text primary key default gen_random_uuid()::text,
  service_id      text references services(id),
  freelancer_id   text references freelancers(id),
  client_name     text not null,
  client_email    text,
  brief           text not null,
  amount_usdc     numeric not null,
  platform_fee    numeric not null,
  net_amount_usdc numeric not null,
  status          contract_status default 'PENDING_DELIVERY',
  escrow_tx_hash  text,
  settle_tx_hash  text,
  agent_score     numeric,
  agent_reasoning text,
  circle_escrow_id text,
  client_wallet_id text,
  delivery_note   text,
  delivered_at    timestamptz,
  settled_at      timestamptz,
  disputed_at     timestamptz,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create table transactions (
  id           text primary key default gen_random_uuid()::text,
  contract_id  text not null,
  type         text not null,
  amount_usdc  numeric not null,
  tx_hash      text,
  chain        text default 'ARC-TESTNET',
  status       text default 'PENDING',
  created_at   timestamptz default now()
);

-- Indexes for performance
create index on services(slug);
create index on contracts(service_id);
create index on contracts(freelancer_id);
create index on contracts(status);
create index on transactions(contract_id);

-- Enable realtime for live dashboard updates
alter publication supabase_realtime add table contracts;
alter publication supabase_realtime add table transactions;

-- Row Level Security (allow all for hackathon)
alter table freelancers enable row level security;
alter table services enable row level security;
alter table contracts enable row level security;
alter table transactions enable row level security;

create policy "Allow all" on freelancers for all using (true);
create policy "Allow all" on services for all using (true);
create policy "Allow all" on contracts for all using (true);
create policy "Allow all" on transactions for all using (true);
