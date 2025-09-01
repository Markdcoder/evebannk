create table if not exists app_user (
  uid uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  name text,
  kyc_status text not null default 'pending',
  created_at timestamptz default now()
);

create table if not exists virtual_account (
  id bigserial primary key,
  uid uuid references app_user(uid) on delete cascade,
  provider text not null default 'flutterwave',
  account_number text not null,
  bank_name text not null,
  account_reference text,
  currency text not null default 'NGN',
  status text not null default 'active',
  created_at timestamptz default now()
);

create table if not exists txn (
  id bigserial primary key,
  uid uuid references app_user(uid) on delete set null,
  provider text not null default 'flutterwave',
  provider_event_id text unique,
  account_number text,
  amount numeric(18,2) not null,
  currency text not null default 'NGN',
  type text not null default 'credit',
  narration text,
  raw jsonb,
  created_at timestamptz default now()
);

create or replace view balance as
select uid, currency,
       coalesce(sum(case when type='credit' then amount else -amount end),0) as amount
from txn group by uid, currency;
