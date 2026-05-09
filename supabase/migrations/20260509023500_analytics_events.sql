create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 80),
  payload jsonb not null default '{}'::jsonb,
  path text,
  occurred_at timestamptz not null default now(),
  user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.analytics_events enable row level security;

drop policy if exists "analytics_events_insert_public" on public.analytics_events;
drop policy if exists "analytics insert public" on public.analytics_events;

create policy "analytics insert public"
  on public.analytics_events
  for insert
  to anon, authenticated
  with check (true);

grant insert on public.analytics_events to anon, authenticated;

create index if not exists analytics_events_name_created_at_idx
  on public.analytics_events (name, created_at desc);

create index if not exists analytics_events_user_id_created_at_idx
  on public.analytics_events (user_id, created_at desc)
  where user_id is not null;
