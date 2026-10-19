-- Portfolio chat assistant: every question is logged here, and the same rows drive the
-- rate limits: per browser id for good, and per hashed IP and site-wide over a rolling
-- 24 hours. Run once in the Supabase SQL editor (safe to re-run).

create table if not exists public.chat_logs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  browser_id text not null,
  ip_hash text not null,
  status text not null default 'pending' check (status in ('pending', 'ok', 'error')),
  question text not null,
  answer text,
  tools text[] not null default '{}',
  model text,
  input_tokens integer,
  output_tokens integer,
  latency_ms integer,
  cost_usd numeric(10, 6),
  error text
);

create index if not exists chat_logs_browser_idx on public.chat_logs (browser_id, created_at desc);
create index if not exists chat_logs_ip_idx on public.chat_logs (ip_hash, created_at desc);
create index if not exists chat_logs_created_idx on public.chat_logs (created_at desc);

-- Only the server (service role) writes; the signed-in admin page reads
alter table public.chat_logs enable row level security;
drop policy if exists "Admin can read chat logs" on public.chat_logs;
create policy "Admin can read chat logs" on public.chat_logs for select to authenticated using (true);

-- A visitor's questions ever, plus IP and site-wide usage in the last 24 hours.
-- Failed requests ('error') don't count against anyone.
create or replace function public.chat_quota(p_browser_id text, p_ip_hash text)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'browser', (select count(*) from chat_logs where browser_id = p_browser_id and status <> 'error'),
    'ip', count(*) filter (where ip_hash = p_ip_hash),
    'global', count(*),
    'ip_oldest', min(created_at) filter (where ip_hash = p_ip_hash),
    'global_oldest', min(created_at)
  )
  from chat_logs
  where created_at > now() - interval '24 hours' and status <> 'error';
$$;

-- Checks every limit and records the question in one transaction, so parallel
-- requests can't slip past a limit together
create or replace function public.chat_reserve(
  p_browser_id text,
  p_ip_hash text,
  p_question text,
  p_browser_limit integer,
  p_ip_limit integer,
  p_global_limit integer
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  usage jsonb;
  new_id uuid;
begin
  perform pg_advisory_xact_lock(hashtext('chat_reserve'));
  usage := chat_quota(p_browser_id, p_ip_hash);

  if (usage->>'global')::int >= p_global_limit
    or (usage->>'ip')::int >= p_ip_limit
    or (usage->>'browser')::int >= p_browser_limit then
    return usage;
  end if;

  insert into chat_logs (browser_id, ip_hash, question)
  values (p_browser_id, p_ip_hash, left(p_question, 1000))
  returning id into new_id;

  return chat_quota(p_browser_id, p_ip_hash) || jsonb_build_object('id', new_id);
end;
$$;

revoke all on function public.chat_quota(text, text) from public, anon, authenticated;
revoke all on function public.chat_reserve(text, text, text, integer, integer, integer) from public, anon, authenticated;
grant execute on function public.chat_quota(text, text) to service_role;
grant execute on function public.chat_reserve(text, text, text, integer, integer, integer) to service_role;
