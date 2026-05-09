-- KAFConnect esports operating system foundation.
-- Adds real data contracts for clan management, transfers, tactics, check-ins,
-- evidence, penalties, activity, and audit logging.

alter table public.tournaments
  add column if not exists platform text default 'Mobile',
  add column if not exists language text default 'English',
  add column if not exists visibility text default 'public';

create table if not exists public.platform_audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  clan_id uuid references public.clans(id) on delete set null,
  tournament_id uuid references public.tournaments(id) on delete set null,
  match_id uuid references public.matches(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
alter table public.platform_audit_events enable row level security;
create policy "audit admins read" on public.platform_audit_events
  for select using (public.is_admin(auth.uid()));
create policy "audit actor insert" on public.platform_audit_events
  for insert to authenticated with check (auth.uid() = actor_id or public.is_admin(auth.uid()));

create table if not exists public.activity_events (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  visibility text not null default 'public',
  event_type text not null,
  title text not null,
  body text,
  link text,
  clan_id uuid references public.clans(id) on delete cascade,
  tournament_id uuid references public.tournaments(id) on delete cascade,
  player_id uuid references public.players(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists idx_activity_events_time on public.activity_events(created_at desc);
create index if not exists idx_activity_events_clan on public.activity_events(clan_id, created_at desc);
alter table public.activity_events enable row level security;
create policy "activity public read" on public.activity_events
  for select using (visibility = 'public' or actor_id = auth.uid() or public.is_admin(auth.uid()));
create policy "activity authed insert" on public.activity_events
  for insert to authenticated with check (auth.uid() = actor_id or public.is_admin(auth.uid()));

create table if not exists public.player_contracts (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players(id) on delete cascade,
  clan_id uuid not null references public.clans(id) on delete cascade,
  status text not null default 'active',
  contract_type text not null default 'main_roster',
  role_promise text,
  tactical_role text,
  salary_amount numeric(12,2),
  salary_currency text not null default 'KAF',
  buyout_clause numeric(12,2),
  starts_at date not null default current_date,
  ends_at date,
  trial_ends_at date,
  transfer_listed boolean not null default false,
  loan_allowed boolean not null default false,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint player_contracts_status_check check (status in ('active','expiring','expired','suspended','transfer-listed','negotiating','released','trial','loan','academy'))
);
create index if not exists idx_player_contracts_clan on public.player_contracts(clan_id, status);
create index if not exists idx_player_contracts_player on public.player_contracts(player_id, status);
alter table public.player_contracts enable row level security;
create policy "contracts readable to involved" on public.player_contracts
  for select using (
    public.is_admin(auth.uid())
    or exists (select 1 from public.players p where p.id = player_id and p.profile_id = auth.uid())
    or exists (select 1 from public.clans c where c.id = clan_id and (c.captain_profile_id = auth.uid() or c.owner_profile_id = auth.uid()))
  );
create policy "contracts clan leaders write" on public.player_contracts
  for all to authenticated using (
    public.is_admin(auth.uid())
    or exists (select 1 from public.clans c where c.id = clan_id and (c.captain_profile_id = auth.uid() or c.owner_profile_id = auth.uid()))
  ) with check (
    public.is_admin(auth.uid())
    or exists (select 1 from public.clans c where c.id = clan_id and (c.captain_profile_id = auth.uid() or c.owner_profile_id = auth.uid()))
  );

create table if not exists public.player_reputation (
  player_id uuid primary key references public.players(id) on delete cascade,
  reliability_score integer not null default 70,
  sportsmanship_score integer not null default 70,
  activity_score integer not null default 70,
  competitive_rating integer not null default 1000,
  no_show_count integer not null default 0,
  dispute_count integer not null default 0,
  updated_at timestamptz not null default now(),
  constraint reputation_bounds check (
    reliability_score between 0 and 100 and sportsmanship_score between 0 and 100 and activity_score between 0 and 100
  )
);
alter table public.player_reputation enable row level security;
create policy "reputation public read" on public.player_reputation for select using (true);
create policy "reputation admin write" on public.player_reputation
  for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

create table if not exists public.transfer_negotiations (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players(id) on delete cascade,
  from_clan_id uuid references public.clans(id) on delete set null,
  to_clan_id uuid references public.clans(id) on delete set null,
  status text not null default 'draft',
  salary_amount numeric(12,2),
  salary_currency text not null default 'KAF',
  contract_duration_months integer,
  role_promise text,
  starter_guarantee boolean not null default false,
  tournament_guarantee text,
  buyout_clause numeric(12,2),
  requested_by uuid references public.profiles(id) on delete set null,
  decided_by uuid references public.profiles(id) on delete set null,
  decided_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint transfer_negotiations_status_check check (status in ('draft','sent','negotiating','accepted','rejected','withdrawn','expired'))
);
create index if not exists idx_transfer_negotiations_player on public.transfer_negotiations(player_id, created_at desc);
create index if not exists idx_transfer_negotiations_clans on public.transfer_negotiations(from_clan_id, to_clan_id, status);
alter table public.transfer_negotiations enable row level security;
create policy "transfers involved read" on public.transfer_negotiations
  for select using (
    public.is_admin(auth.uid())
    or requested_by = auth.uid()
    or exists (select 1 from public.players p where p.id = player_id and p.profile_id = auth.uid())
    or exists (select 1 from public.clans c where c.id in (from_clan_id, to_clan_id) and (c.captain_profile_id = auth.uid() or c.owner_profile_id = auth.uid()))
  );
create policy "transfers authed create" on public.transfer_negotiations
  for insert to authenticated with check (auth.uid() = requested_by);
create policy "transfers involved update" on public.transfer_negotiations
  for update using (
    public.is_admin(auth.uid())
    or requested_by = auth.uid()
    or exists (select 1 from public.players p where p.id = player_id and p.profile_id = auth.uid())
    or exists (select 1 from public.clans c where c.id in (from_clan_id, to_clan_id) and (c.captain_profile_id = auth.uid() or c.owner_profile_id = auth.uid()))
  );

create table if not exists public.clan_tactical_presets (
  id uuid primary key default gen_random_uuid(),
  clan_id uuid not null references public.clans(id) on delete cascade,
  name text not null,
  formation text not null default '4-3-3',
  style text not null default 'balanced',
  training_focus text,
  plan jsonb not null default '{}'::jsonb,
  created_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
alter table public.clan_tactical_presets enable row level security;
create policy "tactics clan read" on public.clan_tactical_presets
  for select using (
    public.is_admin(auth.uid())
    or exists (select 1 from public.clans c where c.id = clan_id and (c.captain_profile_id = auth.uid() or c.owner_profile_id = auth.uid()))
    or exists (select 1 from public.clan_members cm join public.players p on p.id = cm.player_id where cm.clan_id = clan_id and p.profile_id = auth.uid())
    or exists (select 1 from public.clan_members cm where cm.clan_id = clan_id and cm.profile_id = auth.uid())
  );
create policy "tactics leaders write" on public.clan_tactical_presets
  for all to authenticated using (
    public.is_admin(auth.uid())
    or exists (select 1 from public.clans c where c.id = clan_id and (c.captain_profile_id = auth.uid() or c.owner_profile_id = auth.uid()))
  ) with check (
    public.is_admin(auth.uid())
    or exists (select 1 from public.clans c where c.id = clan_id and (c.captain_profile_id = auth.uid() or c.owner_profile_id = auth.uid()))
  );

create table if not exists public.match_lineups (
  id uuid primary key default gen_random_uuid(),
  match_id uuid references public.matches(id) on delete cascade,
  room_id uuid references public.clan_match_rooms(id) on delete cascade,
  clan_id uuid not null references public.clans(id) on delete cascade,
  tactical_preset_id uuid references public.clan_tactical_presets(id) on delete set null,
  status text not null default 'draft',
  starters jsonb not null default '[]'::jsonb,
  substitutes jsonb not null default '[]'::jsonb,
  responsibilities jsonb not null default '{}'::jsonb,
  notes text,
  locked_by uuid references public.profiles(id) on delete set null,
  locked_at timestamptz,
  created_at timestamptz not null default now(),
  constraint match_lineups_status_check check (status in ('draft','submitted','locked','reopened'))
);
alter table public.match_lineups enable row level security;
create policy "lineups clan read" on public.match_lineups for select using (
  public.is_admin(auth.uid())
  or exists (select 1 from public.clans c where c.id = clan_id and (c.captain_profile_id = auth.uid() or c.owner_profile_id = auth.uid()))
  or exists (select 1 from public.clan_members cm join public.players p on p.id = cm.player_id where cm.clan_id = clan_id and p.profile_id = auth.uid())
  or exists (select 1 from public.clan_members cm where cm.clan_id = clan_id and cm.profile_id = auth.uid())
);
create policy "lineups leaders write" on public.match_lineups for all to authenticated using (
  public.is_admin(auth.uid())
  or exists (select 1 from public.clans c where c.id = clan_id and (c.captain_profile_id = auth.uid() or c.owner_profile_id = auth.uid()))
) with check (
  public.is_admin(auth.uid())
  or exists (select 1 from public.clans c where c.id = clan_id and (c.captain_profile_id = auth.uid() or c.owner_profile_id = auth.uid()))
);

create table if not exists public.tournament_checkins (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.tournaments(id) on delete cascade,
  registration_id uuid references public.tournament_registrations(id) on delete cascade,
  clan_id uuid references public.clans(id) on delete cascade,
  player_id uuid references public.players(id) on delete cascade,
  status text not null default 'pending',
  checked_in_by uuid references public.profiles(id) on delete set null,
  checked_in_at timestamptz,
  roster_locked_at timestamptz,
  missing_players jsonb not null default '[]'::jsonb,
  notes text,
  created_at timestamptz not null default now(),
  unique(tournament_id, registration_id),
  constraint tournament_checkins_status_check check (status in ('pending','ready','late','missing_players','locked','withdrawn'))
);
alter table public.tournament_checkins enable row level security;
create policy "checkins participants read" on public.tournament_checkins for select using (auth.uid() is not null or public.is_admin(auth.uid()));
create policy "checkins authed write" on public.tournament_checkins for all to authenticated using (auth.uid() is not null) with check (auth.uid() is not null);

create table if not exists public.tournament_admins (
  tournament_id uuid not null references public.tournaments(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'admin',
  permissions jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  primary key (tournament_id, profile_id)
);
alter table public.tournament_admins enable row level security;
create policy "tournament admins read" on public.tournament_admins for select using (auth.uid() = profile_id or public.is_admin(auth.uid()));
create policy "tournament admins platform write" on public.tournament_admins for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

create table if not exists public.broadcast_slots (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid references public.tournaments(id) on delete cascade,
  match_id uuid references public.matches(id) on delete cascade,
  title text not null,
  provider text not null default 'youtube',
  stream_url text,
  commentator_ids uuid[] not null default '{}'::uuid[],
  observer_ids uuid[] not null default '{}'::uuid[],
  scheduled_at timestamptz,
  status text not null default 'scheduled',
  created_at timestamptz not null default now()
);
alter table public.broadcast_slots enable row level security;
create policy "broadcasts public read" on public.broadcast_slots for select using (true);
create policy "broadcasts admins write" on public.broadcast_slots for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

create table if not exists public.evidence_items (
  id uuid primary key default gen_random_uuid(),
  dispute_id uuid references public.disputes(id) on delete cascade,
  match_id uuid references public.matches(id) on delete cascade,
  room_id uuid references public.clan_match_rooms(id) on delete cascade,
  uploaded_by uuid references public.profiles(id) on delete set null,
  evidence_type text not null default 'screenshot',
  file_url text,
  external_url text,
  stream_timestamp text,
  notes text,
  admin_annotation text,
  created_at timestamptz not null default now()
);
alter table public.evidence_items enable row level security;
create policy "evidence authed read" on public.evidence_items for select using (auth.uid() is not null or public.is_admin(auth.uid()));
create policy "evidence authed insert" on public.evidence_items for insert to authenticated with check (auth.uid() = uploaded_by);
create policy "evidence admin update" on public.evidence_items for update using (public.is_admin(auth.uid()));

create table if not exists public.match_room_messages (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  message text not null,
  attachment_url text,
  message_type text not null default 'chat',
  created_at timestamptz not null default now()
);
create index if not exists idx_match_room_messages_match on public.match_room_messages(match_id, created_at asc);
alter table public.match_room_messages enable row level security;
create policy "match room authed read" on public.match_room_messages for select using (auth.uid() is not null);
create policy "match room authed insert" on public.match_room_messages for insert to authenticated with check (auth.uid() = sender_id);

create table if not exists public.penalties (
  id uuid primary key default gen_random_uuid(),
  target_profile_id uuid references public.profiles(id) on delete cascade,
  target_clan_id uuid references public.clans(id) on delete cascade,
  tournament_id uuid references public.tournaments(id) on delete set null,
  match_id uuid references public.matches(id) on delete set null,
  penalty_type text not null,
  reason text not null,
  points_delta integer,
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  issued_by uuid references public.profiles(id) on delete set null,
  status text not null default 'active',
  created_at timestamptz not null default now()
);
alter table public.penalties enable row level security;
create policy "penalties self or admin read" on public.penalties for select using (
  public.is_admin(auth.uid())
  or target_profile_id = auth.uid()
  or exists (select 1 from public.clans c where c.id = target_clan_id and (c.captain_profile_id = auth.uid() or c.owner_profile_id = auth.uid()))
);
create policy "penalties admin write" on public.penalties for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

insert into storage.buckets (id, name, public)
values
  ('clan-media', 'clan-media', true),
  ('tournament-media', 'tournament-media', true),
  ('match-evidence', 'match-evidence', false)
on conflict (id) do nothing;
