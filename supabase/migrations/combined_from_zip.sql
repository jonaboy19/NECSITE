-- === 20260502121412_458426d2-f5f6-44d7-8298-465aac47af33.sql ===

-- ============ ENUMS ============
create type public.app_role as enum ('user','player','clan_admin','tournament_admin','super_admin');
create type public.tournament_status as enum ('draft','registration_open','active','completed');
create type public.registration_status as enum ('pending','approved','rejected','withdrawn');
create type public.registration_type as enum ('solo','clan','team');
create type public.match_status as enum ('scheduled','live','completed','disputed');
create type public.result_status as enum ('pending','approved','rejected');
create type public.dispute_status as enum ('open','reviewing','resolved','rejected');
create type public.ranking_type as enum ('player','clan');
create type public.clan_member_role as enum ('captain','co_captain','player','coach','manager','sub','analyst');

-- ============ PROFILES ============
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  gamertag text unique,
  country text,
  region text,
  avatar_url text,
  bio text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

-- ============ USER_ROLES ============
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role app_role not null default 'user',
  created_at timestamptz not null default now(),
  unique(user_id, role)
);
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public
as $$ select exists(select 1 from public.user_roles where user_id=_user_id and role=_role) $$;

create or replace function public.is_admin(_user_id uuid)
returns boolean language sql stable security definer set search_path = public
as $$ select exists(select 1 from public.user_roles where user_id=_user_id and role in ('tournament_admin','super_admin')) $$;

-- ============ CLANS ============
create table public.clans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  tag text not null unique,
  country text,
  region text,
  logo_url text,
  captain_profile_id uuid references public.profiles(id) on delete set null,
  coach_name text,
  recruitment_status text default 'open',
  wins int not null default 0,
  losses int not null default 0,
  trophies text,
  description text,
  social_links jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);
alter table public.clans enable row level security;

-- ============ PLAYERS ============
create table public.players (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid unique references public.profiles(id) on delete cascade,
  gamertag text not null,
  country text,
  region text,
  main_game text default 'eFootball Mobile',
  role text,
  current_clan_id uuid references public.clans(id) on delete set null,
  wins int not null default 0,
  losses int not null default 0,
  goals_scored int not null default 0,
  goals_conceded int not null default 0,
  ranking_points int not null default 1000,
  form text default '',
  bio text,
  avatar_url text,
  flag text,
  created_at timestamptz not null default now()
);
alter table public.players enable row level security;

-- ============ CLAN MEMBERS ============
create table public.clan_members (
  id uuid primary key default gen_random_uuid(),
  clan_id uuid not null references public.clans(id) on delete cascade,
  player_id uuid not null references public.players(id) on delete cascade,
  member_role clan_member_role not null default 'player',
  title text,
  joined_at timestamptz not null default now(),
  unique(clan_id, player_id)
);
alter table public.clan_members enable row level security;

-- ============ TOURNAMENTS ============
create table public.tournaments (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  game text not null default 'eFootball Mobile',
  region text default 'Global',
  format text default 'Single Elimination',
  team_size int default 1,
  status tournament_status not null default 'draft',
  registration_deadline timestamptz,
  start_date timestamptz,
  prize_pool text,
  rules text,
  description text,
  featured boolean not null default false,
  banner_url text,
  organizer text default 'KAF Org',
  max_participants int default 32,
  stream_url text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
alter table public.tournaments enable row level security;

create table public.tournament_registrations (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.tournaments(id) on delete cascade,
  player_id uuid references public.players(id) on delete cascade,
  clan_id uuid references public.clans(id) on delete cascade,
  status registration_status not null default 'pending',
  registration_type registration_type not null default 'solo',
  notes text,
  submitted_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
alter table public.tournament_registrations enable row level security;

-- ============ MATCHES ============
create table public.matches (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid references public.tournaments(id) on delete cascade,
  round text,
  stage text,
  player1_id uuid references public.players(id) on delete set null,
  player2_id uuid references public.players(id) on delete set null,
  clan1_id uuid references public.clans(id) on delete set null,
  clan2_id uuid references public.clans(id) on delete set null,
  scheduled_at timestamptz,
  status match_status not null default 'scheduled',
  score_1 int,
  score_2 int,
  stream_url text,
  vod_url text,
  created_at timestamptz not null default now()
);
alter table public.matches enable row level security;

create table public.match_results (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  submitted_by uuid references public.profiles(id) on delete set null,
  score_1 int not null,
  score_2 int not null,
  screenshot_url text,
  notes text,
  status result_status not null default 'pending',
  created_at timestamptz not null default now()
);
alter table public.match_results enable row level security;

create table public.disputes (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  opened_by uuid references public.profiles(id) on delete set null,
  reason text not null,
  evidence_url text,
  status dispute_status not null default 'open',
  admin_notes text,
  created_at timestamptz not null default now()
);
alter table public.disputes enable row level security;

-- ============ RANKINGS ============
create table public.rankings (
  id uuid primary key default gen_random_uuid(),
  season text not null default 'S1',
  game text not null default 'eFootball Mobile',
  ranking_type ranking_type not null,
  player_id uuid references public.players(id) on delete cascade,
  clan_id uuid references public.clans(id) on delete cascade,
  points int not null default 0,
  wins int not null default 0,
  losses int not null default 0,
  goals_scored int not null default 0,
  goals_conceded int not null default 0,
  goal_difference int not null default 0,
  matches_played int not null default 0,
  updated_at timestamptz not null default now()
);
alter table public.rankings enable row level security;

-- ============ NEWS ============
create table public.news_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  category text default 'announcement',
  excerpt text,
  content text,
  cover_url text,
  published boolean not null default false,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
alter table public.news_posts enable row level security;

-- ============ SPONSORS ============
create table public.sponsors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_url text,
  website_url text,
  package_type text,
  active boolean not null default true,
  description text,
  created_at timestamptz not null default now()
);
alter table public.sponsors enable row level security;

create table public.sponsor_inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  company text,
  package_interest text,
  message text,
  created_at timestamptz not null default now()
);
alter table public.sponsor_inquiries enable row level security;

-- ============ TRIGGER: handle_new_user ============
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, gamertag)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email,'@',1)), coalesce(new.raw_user_meta_data->>'gamertag', split_part(new.email,'@',1)))
  on conflict (id) do nothing;
  insert into public.user_roles (user_id, role) values (new.id, 'user') on conflict do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============ updated_at trigger for profiles ============
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;
create trigger profiles_touch before update on public.profiles for each row execute function public.touch_updated_at();

-- ============ RLS POLICIES ============

-- profiles: public read, own write
create policy "profiles public read" on public.profiles for select using (true);
create policy "profiles self insert" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles self update" on public.profiles for update using (auth.uid() = id);
create policy "profiles admin update" on public.profiles for update using (public.has_role(auth.uid(),'super_admin'));

-- user_roles: read own + admin manage
create policy "roles read own" on public.user_roles for select using (auth.uid() = user_id or public.has_role(auth.uid(),'super_admin'));
create policy "roles admin all" on public.user_roles for all using (public.has_role(auth.uid(),'super_admin')) with check (public.has_role(auth.uid(),'super_admin'));

-- clans: public read; captain or admin write
create policy "clans public read" on public.clans for select using (true);
create policy "clans insert authed" on public.clans for insert to authenticated with check (auth.uid() is not null);
create policy "clans captain update" on public.clans for update using (auth.uid() = captain_profile_id or public.is_admin(auth.uid()));
create policy "clans admin delete" on public.clans for delete using (public.has_role(auth.uid(),'super_admin'));

-- players: public read; own or admin write
create policy "players public read" on public.players for select using (true);
create policy "players self insert" on public.players for insert with check (auth.uid() = profile_id);
create policy "players self update" on public.players for update using (auth.uid() = profile_id or public.is_admin(auth.uid()));
create policy "players admin delete" on public.players for delete using (public.has_role(auth.uid(),'super_admin'));

-- clan_members: public read; clan captain or admin manage
create policy "clan_members public read" on public.clan_members for select using (true);
create policy "clan_members captain manage" on public.clan_members for all
  using (exists(select 1 from public.clans c where c.id = clan_id and (c.captain_profile_id = auth.uid() or public.is_admin(auth.uid()))))
  with check (exists(select 1 from public.clans c where c.id = clan_id and (c.captain_profile_id = auth.uid() or public.is_admin(auth.uid()))));

-- tournaments: public read; admin write
create policy "tournaments public read" on public.tournaments for select using (true);
create policy "tournaments admin write" on public.tournaments for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- tournament_registrations: read own + admins; insert authed; admin update
create policy "treg read public" on public.tournament_registrations for select using (true);
create policy "treg insert authed" on public.tournament_registrations for insert to authenticated
  with check (auth.uid() = submitted_by);
create policy "treg admin update" on public.tournament_registrations for update using (public.is_admin(auth.uid()));
create policy "treg admin delete" on public.tournament_registrations for delete using (public.is_admin(auth.uid()));

-- matches: public read; admin write
create policy "matches public read" on public.matches for select using (true);
create policy "matches admin write" on public.matches for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- match_results: read public; insert by participant or admin; admin update
create policy "mres public read" on public.match_results for select using (true);
create policy "mres insert authed" on public.match_results for insert to authenticated with check (auth.uid() = submitted_by);
create policy "mres admin update" on public.match_results for update using (public.is_admin(auth.uid()));

-- disputes: read public; insert authed; admin update
create policy "disp public read" on public.disputes for select using (true);
create policy "disp insert authed" on public.disputes for insert to authenticated with check (auth.uid() = opened_by);
create policy "disp admin update" on public.disputes for update using (public.is_admin(auth.uid()));

-- rankings: public read; admin write
create policy "rank public read" on public.rankings for select using (true);
create policy "rank admin write" on public.rankings for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- news: public read published; admin write
create policy "news public read" on public.news_posts for select using (published or public.is_admin(auth.uid()));
create policy "news admin write" on public.news_posts for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- sponsors: public read active; admin write
create policy "sponsors public read" on public.sponsors for select using (active or public.is_admin(auth.uid()));
create policy "sponsors admin write" on public.sponsors for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- sponsor inquiries: public insert; admin read
create policy "sinq public insert" on public.sponsor_inquiries for insert with check (true);
create policy "sinq admin read" on public.sponsor_inquiries for select using (public.is_admin(auth.uid()));

-- ============ STORAGE BUCKETS ============
insert into storage.buckets (id, name, public) values
  ('avatars','avatars',true),
  ('clan-logos','clan-logos',true),
  ('tournament-banners','tournament-banners',true),
  ('news-media','news-media',true),
  ('sponsor-logos','sponsor-logos',true),
  ('match-evidence','match-evidence',false)
on conflict (id) do nothing;

-- public bucket policies (read all, owner write)
create policy "public buckets read" on storage.objects for select
  using (bucket_id in ('avatars','clan-logos','tournament-banners','news-media','sponsor-logos'));

create policy "public buckets insert" on storage.objects for insert to authenticated
  with check (bucket_id in ('avatars','clan-logos','tournament-banners','news-media','sponsor-logos')
              and auth.uid()::text = (storage.foldername(name))[1]);

create policy "public buckets update own" on storage.objects for update to authenticated
  using (bucket_id in ('avatars','clan-logos','tournament-banners','news-media','sponsor-logos')
         and auth.uid()::text = (storage.foldername(name))[1]);

create policy "public buckets delete own" on storage.objects for delete to authenticated
  using (bucket_id in ('avatars','clan-logos','tournament-banners','news-media','sponsor-logos')
         and auth.uid()::text = (storage.foldername(name))[1]);

-- match-evidence: owner read/write + admin read
create policy "evidence owner rw" on storage.objects for all to authenticated
  using (bucket_id='match-evidence' and auth.uid()::text = (storage.foldername(name))[1])
  with check (bucket_id='match-evidence' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "evidence admin read" on storage.objects for select to authenticated
  using (bucket_id='match-evidence' and public.is_admin(auth.uid()));


-- === 20260502121504_a7cc7041-1fcb-444d-9f5a-333447de872e.sql ===

-- harden search_path
alter function public.handle_new_user() set search_path = public;
alter function public.touch_updated_at() set search_path = public;

-- restrict execute on internal helpers
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.touch_updated_at() from public, anon, authenticated;
-- has_role / is_admin must remain callable from RLS (definer); restrict from anon
revoke execute on function public.has_role(uuid, app_role) from public, anon;
revoke execute on function public.is_admin(uuid) from public, anon;
grant execute on function public.has_role(uuid, app_role) to authenticated;
grant execute on function public.is_admin(uuid) to authenticated;

-- ============ SEED CLANS ============
insert into public.clans (name, tag, country, region, recruitment_status, wins, losses, trophies, description) values
  ('HYDRÃ˜X','HYDRÃ˜X','Netherlands','Europe','closed',128,22,'KAF Champion S1, MENA Cup Winner','Founding clan of the KAF ecosystem. Elite roster of international eFootball players.'),
  ('Cruise Nation','CRSE','Brazil','Americas','open',96,30,'Selection 2 Finalist','Brazilian-led international squad known for aggressive play.'),
  ('NOVA','NOVA','France','Europe','open',88,34,'KAF Open Runner-up','Tactical, possession-based eFootball clan.'),
  ('KAF All Stars','KAFAS','Global','Global','closed',72,18,'Showmatch Champions','Hand-picked roster representing KAF in exhibition events.'),
  ('MENA Elite','MENA','UAE','MENA','open',64,28,'MENA Cup Winners','Top MENA region clan competing across all KAF events.'),
  ('Asia Flow','FLOW','Thailand','Asia','open',58,32,'Asia Invitational Top 4','Asia-Pacific squad led by JXKMT.'),
  ('Africa Kings','AFKG','Nigeria','Africa','open',54,26,'Africa Cup Winners','Africa''s premier eFootball collective.'),
  ('Europe Titans','EUTI','Germany','Europe','open',61,29,'Europe Open Top 8','German-anchored European roster.')
on conflict (tag) do nothing;

-- ============ SEED PLAYERS (no profile_id, sample) ============
with c as (select id, tag from public.clans)
insert into public.players (gamertag, country, region, main_game, role, current_clan_id, wins, losses, goals_scored, goals_conceded, ranking_points, form, bio, flag) values
  ('H2Ã˜ZERA','Netherlands','Europe','eFootball Mobile','Playmaker',(select id from c where tag='HYDRÃ˜X'),245,42,612,180,2950,'WWWWL','KAF founder. Elite eFootball Mobile competitor.','ðŸ‡³ðŸ‡±'),
  ('JXKMT','Thailand','Asia','eFootball Mobile','Striker',(select id from c where tag='FLOW'),198,55,548,210,2780,'WWLWW','Asia''s top-rated striker.','ðŸ‡¹ðŸ‡­'),
  ('Mago','Brazil','Americas','eFootball Mobile','Winger',(select id from c where tag='CRSE'),176,61,492,225,2640,'WLWWW','Brazilian flair specialist.','ðŸ‡§ðŸ‡·'),
  ('Tams','Egypt','MENA','eFootball Mobile','Striker',(select id from c where tag='HYDRÃ˜X'),188,48,510,195,2700,'WWWWW','HYDRÃ˜X scoring machine.','ðŸ‡ªðŸ‡¬'),
  ('Xelil','Iraq','MENA','eFootball Mobile','Midfielder',(select id from c where tag='HYDRÃ˜X'),172,52,420,190,2620,'WWLWW','Tempo controller.','ðŸ‡®ðŸ‡¶'),
  ('LuizNub','Portugal','Europe','eFootball Mobile','Defender',(select id from c where tag='HYDRÃ˜X'),165,58,310,165,2540,'WWWLL','Defensive anchor.','ðŸ‡µðŸ‡¹'),
  ('Dantas','Portugal','Europe','eFootball Mobile','Playmaker',(select id from c where tag='HYDRÃ˜X'),158,62,398,180,2510,'WLWWW','Creative #10.','ðŸ‡µðŸ‡¹'),
  ('Emir','Turkey','Europe','eFootball Mobile','Striker',(select id from c where tag='HYDRÃ˜X'),170,55,475,200,2580,'WWWWL','Clinical finisher.','ðŸ‡¹ðŸ‡·'),
  ('Ghost','Morocco','Africa','eFootball Mobile','Winger',(select id from c where tag='HYDRÃ˜X'),162,60,440,210,2520,'LWWWW','Speed and dribbling specialist.','ðŸ‡²ðŸ‡¦'),
  ('Barzani','Kurdistan','MENA','eFootball Mobile','Midfielder',(select id from c where tag='HYDRÃ˜X'),155,65,365,205,2470,'WWLWL','Box-to-box engine.','ðŸ‡®ðŸ‡¶');

-- ============ SEED TOURNAMENTS ============
insert into public.tournaments (title, game, region, format, team_size, status, registration_deadline, start_date, prize_pool, description, featured, organizer, max_participants) values
  ('KAF E-League Selection 1','eFootball Mobile','Global','Single Elimination',1,'registration_open', now() + interval '14 days', now() + interval '21 days','$2,000 + Draft Slots','Open qualifier tournament. Top 16 advance to Selection 2 and the KAF E-League draft.', true,'KAF Org',128),
  ('KAF E-League Selection 2','eFootball Mobile','Global','Double Elimination',1,'draft', now() + interval '30 days', now() + interval '45 days','$5,000 + Pro Contracts','Streamed top-16 showcase. Final stage before the KAF E-League player draft.', true,'KAF Org',16),
  ('KAF Ramadan Cup','eFootball Mobile','MENA','Groups + Knockout',1,'registration_open', now() + interval '7 days', now() + interval '10 days','$1,000','Annual Ramadan tournament for MENA region players.', false,'KAF MENA',64),
  ('HYDRÃ˜X Open Invitational','eFootball Mobile','Global','Round Robin',1,'active', now() - interval '3 days', now() - interval '1 days','$1,500','Invitational hosted by HYDRÃ˜X. Live now.', false,'HYDRÃ˜X',16);

-- ============ SEED NEWS ============
insert into public.news_posts (title, slug, category, excerpt, content, published) values
  ('KAF E-League Phase 1 Opens','kaf-eleague-phase-1-opens','tournament','Selection 1 registration is now live for all eFootball Mobile players globally.','The official KAF E-League pipeline begins. Phase 1 (Selection 1) opens registration today. Top 16 players advance to the streamed Selection 2.', true),
  ('HYDRÃ˜X Wins MENA Cup','hydrox-wins-mena-cup','clan','HYDRÃ˜X takes home the MENA Cup trophy after a 4â€“2 final.','HYDRÃ˜X continued their dominant 2026 with another regional title.', true),
  ('Sponsor Slots Open for KAF E-League','sponsor-slots-open','sponsor','Brands can now apply for KAF E-League sponsorship packages.','Four sponsor packages available. See the Sponsors page for details.', true);

-- ============ SEED SPONSORS ============
insert into public.sponsors (name, package_type, active, description) values
  ('OpenSlot â€” Main Sponsor','main', true,'Premier league-wide visibility across all KAF E-League broadcasts.'),
  ('OpenSlot â€” Tournament Sponsor','tournament', true,'Tournament-level branding with dedicated trophy presentation.'),
  ('OpenSlot â€” Stream Partner','stream', true,'Branded overlay on YouTube/Twitch live streams.');


-- === 20260502123834_706d200f-0137-4e4f-8f3d-621fe7dea994.sql ===

-- Expand app_role enum
DO $$ BEGIN
  ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'verified_player';
EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'clan_owner'; EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'clan_manager'; EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'referee'; EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'host'; EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'league_admin'; EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'sponsor'; EXCEPTION WHEN others THEN NULL; END $$;

-- Player extras
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS status text DEFAULT 'in_clan';
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS availability text DEFAULT 'available';
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS verified boolean NOT NULL DEFAULT false;
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS draft_eligible boolean NOT NULL DEFAULT false;
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS playstyle text;

-- Tournament extras
ALTER TABLE public.tournaments ADD COLUMN IF NOT EXISTS pinned boolean NOT NULL DEFAULT false;
ALTER TABLE public.tournaments ADD COLUMN IF NOT EXISTS is_kaf_official boolean NOT NULL DEFAULT false;
ALTER TABLE public.tournaments ADD COLUMN IF NOT EXISTS community_id uuid;

-- Clan extras
ALTER TABLE public.clans ADD COLUMN IF NOT EXISTS community_id uuid;
ALTER TABLE public.clans ADD COLUMN IF NOT EXISTS verified boolean NOT NULL DEFAULT false;
ALTER TABLE public.clans ADD COLUMN IF NOT EXISTS founded_date date;
ALTER TABLE public.clans ADD COLUMN IF NOT EXISTS reputation int NOT NULL DEFAULT 0;

-- COMMUNITIES
CREATE TABLE IF NOT EXISTS public.communities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  scope text NOT NULL DEFAULT 'global', -- global | continent | country | region | custom
  country text,
  region text,
  continent text,
  description text,
  logo_url text,
  banner_url text,
  is_official boolean NOT NULL DEFAULT false,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "communities public read" ON public.communities;
CREATE POLICY "communities public read" ON public.communities FOR SELECT USING (true);
DROP POLICY IF EXISTS "communities admin write" ON public.communities;
CREATE POLICY "communities admin write" ON public.communities FOR ALL
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- CLAN INVITES
CREATE TABLE IF NOT EXISTS public.clan_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clan_id uuid NOT NULL,
  invited_player_id uuid NOT NULL,
  invited_by uuid,
  message text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.clan_invites ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "invites read involved" ON public.clan_invites;
CREATE POLICY "invites read involved" ON public.clan_invites FOR SELECT USING (true);
DROP POLICY IF EXISTS "invites captain insert" ON public.clan_invites;
CREATE POLICY "invites captain insert" ON public.clan_invites FOR INSERT WITH CHECK (
  EXISTS(SELECT 1 FROM public.clans c WHERE c.id = clan_id AND (c.captain_profile_id = auth.uid() OR public.is_admin(auth.uid())))
);
DROP POLICY IF EXISTS "invites update involved" ON public.clan_invites;
CREATE POLICY "invites update involved" ON public.clan_invites FOR UPDATE USING (
  EXISTS(SELECT 1 FROM public.clans c WHERE c.id = clan_id AND c.captain_profile_id = auth.uid())
  OR EXISTS(SELECT 1 FROM public.players p WHERE p.id = invited_player_id AND p.profile_id = auth.uid())
  OR public.is_admin(auth.uid())
);

-- CLAN JOIN REQUESTS
CREATE TABLE IF NOT EXISTS public.clan_join_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clan_id uuid NOT NULL,
  player_id uuid NOT NULL,
  message text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.clan_join_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "joinreq public read" ON public.clan_join_requests;
CREATE POLICY "joinreq public read" ON public.clan_join_requests FOR SELECT USING (true);
DROP POLICY IF EXISTS "joinreq player insert" ON public.clan_join_requests;
CREATE POLICY "joinreq player insert" ON public.clan_join_requests FOR INSERT WITH CHECK (
  EXISTS(SELECT 1 FROM public.players p WHERE p.id = player_id AND p.profile_id = auth.uid())
);
DROP POLICY IF EXISTS "joinreq update captain or self" ON public.clan_join_requests;
CREATE POLICY "joinreq update captain or self" ON public.clan_join_requests FOR UPDATE USING (
  EXISTS(SELECT 1 FROM public.clans c WHERE c.id = clan_id AND (c.captain_profile_id = auth.uid() OR public.is_admin(auth.uid())))
  OR EXISTS(SELECT 1 FROM public.players p WHERE p.id = player_id AND p.profile_id = auth.uid())
);

-- NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL DEFAULT 'system',
  title text NOT NULL,
  body text,
  link text,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "notif read own" ON public.notifications;
CREATE POLICY "notif read own" ON public.notifications FOR SELECT USING (auth.uid() = user_id OR public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "notif update own" ON public.notifications;
CREATE POLICY "notif update own" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "notif admin insert" ON public.notifications;
CREATE POLICY "notif admin insert" ON public.notifications FOR INSERT WITH CHECK (
  public.is_admin(auth.uid()) OR auth.uid() = user_id
);


-- === 20260502124640_915716ee-3744-4b89-9d8c-d6ebb9819456.sql ===
-- 1. Extend clans table with customization + formation fields
ALTER TABLE public.clans
  ADD COLUMN IF NOT EXISTS banner_url text,
  ADD COLUMN IF NOT EXISTS motto text,
  ADD COLUMN IF NOT EXISTS primary_color text DEFAULT '#7c3aed',
  ADD COLUMN IF NOT EXISTS accent_color text DEFAULT '#22d3ee',
  ADD COLUMN IF NOT EXISTS formation text DEFAULT '4-3-3',
  ADD COLUMN IF NOT EXISTS lineup jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS achievements jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS home_kit_url text,
  ADD COLUMN IF NOT EXISTS away_kit_url text,
  ADD COLUMN IF NOT EXISTS stadium_name text,
  ADD COLUMN IF NOT EXISTS established_year integer;

-- 2. Storage bucket for clan banners
INSERT INTO storage.buckets (id, name, public)
VALUES ('clan-banners', 'clan-banners', true)
ON CONFLICT (id) DO NOTHING;

-- 3. RLS for clan-banners
DROP POLICY IF EXISTS "clan-banners public read" ON storage.objects;
CREATE POLICY "clan-banners public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'clan-banners');

DROP POLICY IF EXISTS "clan-banners authed write" ON storage.objects;
CREATE POLICY "clan-banners authed write"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'clan-banners');

DROP POLICY IF EXISTS "clan-banners authed update" ON storage.objects;
CREATE POLICY "clan-banners authed update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'clan-banners');

DROP POLICY IF EXISTS "clan-banners authed delete" ON storage.objects;
CREATE POLICY "clan-banners authed delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'clan-banners');

-- 4. Make sure clan-logos has the same write policies (in case missing)
DROP POLICY IF EXISTS "clan-logos public read" ON storage.objects;
CREATE POLICY "clan-logos public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'clan-logos');

DROP POLICY IF EXISTS "clan-logos authed write" ON storage.objects;
CREATE POLICY "clan-logos authed write"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'clan-logos');

DROP POLICY IF EXISTS "clan-logos authed update" ON storage.objects;
CREATE POLICY "clan-logos authed update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'clan-logos');

DROP POLICY IF EXISTS "clan-logos authed delete" ON storage.objects;
CREATE POLICY "clan-logos authed delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'clan-logos');

-- === 20260502130126_a9eeedd3-f0f2-4633-a2d3-7d1e8fb2ee43.sql ===

-- ============================================================
-- 1. WIPE MOCK DATA (keep auth users, roles, storage)
-- ============================================================
DELETE FROM public.match_results;
DELETE FROM public.disputes;
DELETE FROM public.matches;
DELETE FROM public.tournament_registrations;
DELETE FROM public.tournaments;
DELETE FROM public.clan_invites;
DELETE FROM public.clan_join_requests;
DELETE FROM public.clan_members;
DELETE FROM public.rankings;
DELETE FROM public.players;
DELETE FROM public.clans;
DELETE FROM public.news_posts;
DELETE FROM public.sponsors;
DELETE FROM public.sponsor_inquiries;
DELETE FROM public.notifications;
DELETE FROM public.communities;

-- ============================================================
-- 2. EXPAND CLAN MEMBER ROLE ENUM
-- ============================================================
DO $$ BEGIN
  ALTER TYPE clan_member_role ADD VALUE IF NOT EXISTS 'owner';
EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE clan_member_role ADD VALUE IF NOT EXISTS 'leader'; EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE clan_member_role ADD VALUE IF NOT EXISTS 'board'; EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE clan_member_role ADD VALUE IF NOT EXISTS 'captain'; EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE clan_member_role ADD VALUE IF NOT EXISTS 'officer_coach'; EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE clan_member_role ADD VALUE IF NOT EXISTS 'officer_analyst'; EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE clan_member_role ADD VALUE IF NOT EXISTS 'officer_recruiter'; EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE clan_member_role ADD VALUE IF NOT EXISTS 'manager'; EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE clan_member_role ADD VALUE IF NOT EXISTS 'moderator'; EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE clan_member_role ADD VALUE IF NOT EXISTS 'substitute'; EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE clan_member_role ADD VALUE IF NOT EXISTS 'trial'; EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE clan_member_role ADD VALUE IF NOT EXISTS 'academy'; EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE clan_member_role ADD VALUE IF NOT EXISTS 'media_admin'; EXCEPTION WHEN others THEN NULL; END $$;

-- ============================================================
-- 3. EXTEND CLANS TABLE WITH FM-STYLE FIELDS
-- ============================================================
ALTER TABLE public.clans
  ADD COLUMN IF NOT EXISTS tier text DEFAULT 'D',
  ADD COLUMN IF NOT EXISTS tier_points integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS elo integer NOT NULL DEFAULT 1000,
  ADD COLUMN IF NOT EXISTS xp integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS level integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS languages text[],
  ADD COLUMN IF NOT EXISTS playstyle text,
  ADD COLUMN IF NOT EXISTS clan_type text DEFAULT 'competitive',
  ADD COLUMN IF NOT EXISTS contact_handle text,
  ADD COLUMN IF NOT EXISTS tournament_ready boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS owner_profile_id uuid;

-- ============================================================
-- 4. COMMUNITY ADMINS (per-community permissions, can expire)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.community_admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id uuid NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  permissions text[] NOT NULL DEFAULT ARRAY['manage_tournaments','approve_clans','resolve_disputes'],
  assigned_by uuid,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  notes text,
  UNIQUE(community_id, user_id)
);
ALTER TABLE public.community_admins ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_community_admin(_user_id uuid, _community_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.community_admins
    WHERE user_id = _user_id AND community_id = _community_id
      AND (expires_at IS NULL OR expires_at > now())
  ) OR public.is_admin(_user_id);
$$;

CREATE POLICY "comadmin public read" ON public.community_admins FOR SELECT USING (true);
CREATE POLICY "comadmin super write" ON public.community_admins FOR ALL
  USING (public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (public.has_role(auth.uid(),'super_admin'));

-- ============================================================
-- 5. CLAN TEAMS (multiple squads per clan)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.clan_teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clan_id uuid NOT NULL REFERENCES public.clans(id) ON DELETE CASCADE,
  name text NOT NULL,
  team_code text,
  logo_url text,
  description text,
  is_primary boolean NOT NULL DEFAULT false,
  default_formation text DEFAULT '4-3-3',
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.clan_teams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "teams public read" ON public.clan_teams FOR SELECT USING (true);
CREATE POLICY "teams captain manage" ON public.clan_teams FOR ALL
  USING (EXISTS (SELECT 1 FROM clans c WHERE c.id = clan_teams.clan_id AND (c.captain_profile_id = auth.uid() OR c.owner_profile_id = auth.uid() OR is_admin(auth.uid()))))
  WITH CHECK (EXISTS (SELECT 1 FROM clans c WHERE c.id = clan_teams.clan_id AND (c.captain_profile_id = auth.uid() OR c.owner_profile_id = auth.uid() OR is_admin(auth.uid()))));

-- ============================================================
-- 6. CLAN TEAM ROSTERS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.clan_team_rosters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.clan_teams(id) ON DELETE CASCADE,
  player_id uuid NOT NULL,
  position text,
  squad_number integer,
  status text NOT NULL DEFAULT 'starter',
  notes text,
  added_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(team_id, player_id)
);
ALTER TABLE public.clan_team_rosters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rosters public read" ON public.clan_team_rosters FOR SELECT USING (true);
CREATE POLICY "rosters captain manage" ON public.clan_team_rosters FOR ALL
  USING (EXISTS (SELECT 1 FROM clan_teams t JOIN clans c ON c.id=t.clan_id WHERE t.id=clan_team_rosters.team_id AND (c.captain_profile_id=auth.uid() OR c.owner_profile_id=auth.uid() OR is_admin(auth.uid()))))
  WITH CHECK (EXISTS (SELECT 1 FROM clan_teams t JOIN clans c ON c.id=t.clan_id WHERE t.id=clan_team_rosters.team_id AND (c.captain_profile_id=auth.uid() OR c.owner_profile_id=auth.uid() OR is_admin(auth.uid()))));

-- ============================================================
-- 7. CLAN TRIALS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.clan_trials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clan_id uuid NOT NULL REFERENCES public.clans(id) ON DELETE CASCADE,
  player_id uuid NOT NULL,
  start_date timestamptz NOT NULL DEFAULT now(),
  end_date timestamptz NOT NULL,
  requirements text,
  status text NOT NULL DEFAULT 'active',
  outcome text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.clan_trials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "trials public read" ON public.clan_trials FOR SELECT USING (true);
CREATE POLICY "trials captain manage" ON public.clan_trials FOR ALL
  USING (EXISTS (SELECT 1 FROM clans c WHERE c.id=clan_trials.clan_id AND (c.captain_profile_id=auth.uid() OR c.owner_profile_id=auth.uid() OR is_admin(auth.uid()))))
  WITH CHECK (EXISTS (SELECT 1 FROM clans c WHERE c.id=clan_trials.clan_id AND (c.captain_profile_id=auth.uid() OR c.owner_profile_id=auth.uid() OR is_admin(auth.uid()))));

-- ============================================================
-- 8. CLAN ONBOARDING (tournament-ready checklist)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.clan_onboarding (
  clan_id uuid PRIMARY KEY REFERENCES public.clans(id) ON DELETE CASCADE,
  branding_done boolean NOT NULL DEFAULT false,
  roster_done boolean NOT NULL DEFAULT false,
  roles_done boolean NOT NULL DEFAULT false,
  settings_done boolean NOT NULL DEFAULT false,
  team_done boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.clan_onboarding ENABLE ROW LEVEL SECURITY;
CREATE POLICY "onboarding public read" ON public.clan_onboarding FOR SELECT USING (true);
CREATE POLICY "onboarding captain manage" ON public.clan_onboarding FOR ALL
  USING (EXISTS (SELECT 1 FROM clans c WHERE c.id=clan_onboarding.clan_id AND (c.captain_profile_id=auth.uid() OR c.owner_profile_id=auth.uid() OR is_admin(auth.uid()))))
  WITH CHECK (EXISTS (SELECT 1 FROM clans c WHERE c.id=clan_onboarding.clan_id AND (c.captain_profile_id=auth.uid() OR c.owner_profile_id=auth.uid() OR is_admin(auth.uid()))));

-- ============================================================
-- 9. ROSTER LOCKS, SNAPSHOTS, COOLDOWNS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.clan_roster_locks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clan_id uuid NOT NULL REFERENCES public.clans(id) ON DELETE CASCADE,
  tournament_id uuid,
  lock_type text NOT NULL DEFAULT 'tournament',
  reason text,
  locked_at timestamptz NOT NULL DEFAULT now(),
  unlocked_at timestamptz,
  locked_by uuid
);
ALTER TABLE public.clan_roster_locks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "locks public read" ON public.clan_roster_locks FOR SELECT USING (true);
CREATE POLICY "locks admin manage" ON public.clan_roster_locks FOR ALL USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

CREATE TABLE IF NOT EXISTS public.clan_roster_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clan_id uuid NOT NULL REFERENCES public.clans(id) ON DELETE CASCADE,
  tournament_id uuid,
  reason text,
  snapshot jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.clan_roster_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "snap public read" ON public.clan_roster_snapshots FOR SELECT USING (true);
CREATE POLICY "snap captain insert" ON public.clan_roster_snapshots FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM clans c WHERE c.id=clan_roster_snapshots.clan_id AND (c.captain_profile_id=auth.uid() OR c.owner_profile_id=auth.uid() OR is_admin(auth.uid()))));

CREATE TABLE IF NOT EXISTS public.clan_membership_cooldowns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid NOT NULL,
  clan_id uuid REFERENCES public.clans(id) ON DELETE SET NULL,
  cooldown_until timestamptz NOT NULL,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.clan_membership_cooldowns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cooldown public read" ON public.clan_membership_cooldowns FOR SELECT USING (true);
CREATE POLICY "cooldown admin write" ON public.clan_membership_cooldowns FOR ALL USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

-- ============================================================
-- 10. MATCH DELEGATES & LINEUPS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.match_delegates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clan_id uuid NOT NULL REFERENCES public.clans(id) ON DELETE CASCADE,
  match_id uuid,
  delegated_to uuid NOT NULL,
  delegated_by uuid NOT NULL,
  permissions text[] NOT NULL DEFAULT ARRAY['manage_lineup','submit_evidence','report_score'],
  created_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz
);
ALTER TABLE public.match_delegates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "delegates public read" ON public.match_delegates FOR SELECT USING (true);
CREATE POLICY "delegates captain manage" ON public.match_delegates FOR ALL
  USING (EXISTS (SELECT 1 FROM clans c WHERE c.id=match_delegates.clan_id AND (c.captain_profile_id=auth.uid() OR c.owner_profile_id=auth.uid() OR is_admin(auth.uid()))))
  WITH CHECK (EXISTS (SELECT 1 FROM clans c WHERE c.id=match_delegates.clan_id AND (c.captain_profile_id=auth.uid() OR c.owner_profile_id=auth.uid() OR is_admin(auth.uid()))));

CREATE TABLE IF NOT EXISTS public.match_lineups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid NOT NULL,
  clan_id uuid NOT NULL REFERENCES public.clans(id) ON DELETE CASCADE,
  team_id uuid REFERENCES public.clan_teams(id) ON DELETE SET NULL,
  formation text NOT NULL DEFAULT '4-3-3',
  starters jsonb NOT NULL DEFAULT '[]'::jsonb,
  substitutes jsonb NOT NULL DEFAULT '[]'::jsonb,
  captain_player_id uuid,
  notes text,
  submitted_by uuid,
  submitted_at timestamptz,
  locked boolean NOT NULL DEFAULT false,
  locked_at timestamptz,
  UNIQUE(match_id, clan_id)
);
ALTER TABLE public.match_lineups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lineups public read" ON public.match_lineups FOR SELECT USING (true);
CREATE POLICY "lineups captain manage" ON public.match_lineups FOR ALL
  USING (EXISTS (SELECT 1 FROM clans c WHERE c.id=match_lineups.clan_id AND (c.captain_profile_id=auth.uid() OR c.owner_profile_id=auth.uid() OR is_admin(auth.uid())))
    OR EXISTS (SELECT 1 FROM match_delegates d WHERE d.match_id=match_lineups.match_id AND d.delegated_to=auth.uid() AND d.revoked_at IS NULL AND 'manage_lineup'=ANY(d.permissions)))
  WITH CHECK (EXISTS (SELECT 1 FROM clans c WHERE c.id=match_lineups.clan_id AND (c.captain_profile_id=auth.uid() OR c.owner_profile_id=auth.uid() OR is_admin(auth.uid())))
    OR EXISTS (SELECT 1 FROM match_delegates d WHERE d.match_id=match_lineups.match_id AND d.delegated_to=auth.uid() AND d.revoked_at IS NULL AND 'manage_lineup'=ANY(d.permissions)));

CREATE TABLE IF NOT EXISTS public.clan_lineup_presets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clan_id uuid NOT NULL REFERENCES public.clans(id) ON DELETE CASCADE,
  team_id uuid REFERENCES public.clan_teams(id) ON DELETE SET NULL,
  name text NOT NULL,
  formation text NOT NULL DEFAULT '4-3-3',
  starters jsonb NOT NULL DEFAULT '[]'::jsonb,
  substitutes jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.clan_lineup_presets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "presets public read" ON public.clan_lineup_presets FOR SELECT USING (true);
CREATE POLICY "presets captain manage" ON public.clan_lineup_presets FOR ALL
  USING (EXISTS (SELECT 1 FROM clans c WHERE c.id=clan_lineup_presets.clan_id AND (c.captain_profile_id=auth.uid() OR c.owner_profile_id=auth.uid() OR is_admin(auth.uid()))))
  WITH CHECK (EXISTS (SELECT 1 FROM clans c WHERE c.id=clan_lineup_presets.clan_id AND (c.captain_profile_id=auth.uid() OR c.owner_profile_id=auth.uid() OR is_admin(auth.uid()))));

-- ============================================================
-- 11. PERFORMANCE STATS, AUDIT, TIER, ELO
-- ============================================================
CREATE TABLE IF NOT EXISTS public.clan_performance_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clan_id uuid NOT NULL REFERENCES public.clans(id) ON DELETE CASCADE,
  player_id uuid NOT NULL,
  matches_played integer NOT NULL DEFAULT 0,
  wins integer NOT NULL DEFAULT 0,
  losses integer NOT NULL DEFAULT 0,
  draws integer NOT NULL DEFAULT 0,
  goals_scored integer NOT NULL DEFAULT 0,
  goals_conceded integer NOT NULL DEFAULT 0,
  mvp_count integer NOT NULL DEFAULT 0,
  rating numeric(4,2) DEFAULT 6.5,
  last_match_at timestamptz,
  UNIQUE(clan_id, player_id)
);
ALTER TABLE public.clan_performance_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "perf public read" ON public.clan_performance_stats FOR SELECT USING (true);
CREATE POLICY "perf captain write" ON public.clan_performance_stats FOR ALL
  USING (EXISTS (SELECT 1 FROM clans c WHERE c.id=clan_performance_stats.clan_id AND (c.captain_profile_id=auth.uid() OR c.owner_profile_id=auth.uid() OR is_admin(auth.uid()))))
  WITH CHECK (EXISTS (SELECT 1 FROM clans c WHERE c.id=clan_performance_stats.clan_id AND (c.captain_profile_id=auth.uid() OR c.owner_profile_id=auth.uid() OR is_admin(auth.uid()))));

CREATE TABLE IF NOT EXISTS public.clan_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clan_id uuid NOT NULL REFERENCES public.clans(id) ON DELETE CASCADE,
  actor_user_id uuid,
  action text NOT NULL,
  target_id uuid,
  old_value jsonb,
  new_value jsonb,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.clan_audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audit member read" ON public.clan_audit_logs FOR SELECT
  USING (EXISTS (SELECT 1 FROM clan_members m JOIN players p ON p.id=m.player_id WHERE m.clan_id=clan_audit_logs.clan_id AND p.profile_id=auth.uid()) OR is_admin(auth.uid()));
CREATE POLICY "audit insert authed" ON public.clan_audit_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

CREATE TABLE IF NOT EXISTS public.clan_tier_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clan_id uuid NOT NULL REFERENCES public.clans(id) ON DELETE CASCADE,
  old_tier text,
  new_tier text,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.clan_tier_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tierhist public read" ON public.clan_tier_history FOR SELECT USING (true);
CREATE POLICY "tierhist admin write" ON public.clan_tier_history FOR INSERT WITH CHECK (is_admin(auth.uid()));

CREATE TABLE IF NOT EXISTS public.clan_elo_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clan_id uuid NOT NULL REFERENCES public.clans(id) ON DELETE CASCADE,
  match_id uuid,
  delta integer NOT NULL,
  new_elo integer NOT NULL,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.clan_elo_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "elolog public read" ON public.clan_elo_log FOR SELECT USING (true);
CREATE POLICY "elolog admin write" ON public.clan_elo_log FOR INSERT WITH CHECK (is_admin(auth.uid()));

-- ============================================================
-- 12. CALENDAR & RSVP
-- ============================================================
CREATE TABLE IF NOT EXISTS public.clan_calendar_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clan_id uuid NOT NULL REFERENCES public.clans(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  event_type text NOT NULL DEFAULT 'practice',
  start_time timestamptz NOT NULL,
  end_time timestamptz,
  timezone text DEFAULT 'UTC',
  location text,
  mandatory boolean NOT NULL DEFAULT false,
  max_participants integer,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.clan_calendar_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cal public read" ON public.clan_calendar_events FOR SELECT USING (true);
CREATE POLICY "cal captain manage" ON public.clan_calendar_events FOR ALL
  USING (EXISTS (SELECT 1 FROM clans c WHERE c.id=clan_calendar_events.clan_id AND (c.captain_profile_id=auth.uid() OR c.owner_profile_id=auth.uid() OR is_admin(auth.uid()))))
  WITH CHECK (EXISTS (SELECT 1 FROM clans c WHERE c.id=clan_calendar_events.clan_id AND (c.captain_profile_id=auth.uid() OR c.owner_profile_id=auth.uid() OR is_admin(auth.uid()))));

CREATE TABLE IF NOT EXISTS public.clan_calendar_rsvps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.clan_calendar_events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  responded_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(event_id, user_id)
);
ALTER TABLE public.clan_calendar_rsvps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rsvp public read" ON public.clan_calendar_rsvps FOR SELECT USING (true);
CREATE POLICY "rsvp self write" ON public.clan_calendar_rsvps FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 13. TRANSFERS, CHANGE REQUESTS, SCOUTING, TROPHIES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.clan_transfers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid NOT NULL,
  from_clan_id uuid REFERENCES public.clans(id) ON DELETE SET NULL,
  to_clan_id uuid REFERENCES public.clans(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending',
  message text,
  initiated_by uuid,
  decided_by uuid,
  decided_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.clan_transfers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tr public read" ON public.clan_transfers FOR SELECT USING (true);
CREATE POLICY "tr authed insert" ON public.clan_transfers FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "tr involved update" ON public.clan_transfers FOR UPDATE
  USING (EXISTS (SELECT 1 FROM players p WHERE p.id=clan_transfers.player_id AND p.profile_id=auth.uid())
    OR EXISTS (SELECT 1 FROM clans c WHERE (c.id=clan_transfers.to_clan_id OR c.id=clan_transfers.from_clan_id) AND (c.captain_profile_id=auth.uid() OR c.owner_profile_id=auth.uid()))
    OR is_admin(auth.uid()));

CREATE TABLE IF NOT EXISTS public.clan_change_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clan_id uuid NOT NULL REFERENCES public.clans(id) ON DELETE CASCADE,
  change_type text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'pending',
  requested_by uuid,
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.clan_change_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ccr public read" ON public.clan_change_requests FOR SELECT USING (true);
CREATE POLICY "ccr captain insert" ON public.clan_change_requests FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM clans c WHERE c.id=clan_change_requests.clan_id AND (c.captain_profile_id=auth.uid() OR c.owner_profile_id=auth.uid())));
CREATE POLICY "ccr admin update" ON public.clan_change_requests FOR UPDATE USING (is_admin(auth.uid()));

CREATE TABLE IF NOT EXISTS public.player_scouting_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clan_id uuid NOT NULL REFERENCES public.clans(id) ON DELETE CASCADE,
  player_id uuid NOT NULL,
  created_by uuid NOT NULL,
  rating integer,
  notes text,
  status text NOT NULL DEFAULT 'watching',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.player_scouting_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "scout member read" ON public.player_scouting_notes FOR SELECT
  USING (EXISTS (SELECT 1 FROM clan_members m JOIN players p ON p.id=m.player_id WHERE m.clan_id=player_scouting_notes.clan_id AND p.profile_id=auth.uid()) OR is_admin(auth.uid()));
CREATE POLICY "scout staff manage" ON public.player_scouting_notes FOR ALL
  USING (EXISTS (SELECT 1 FROM clans c WHERE c.id=player_scouting_notes.clan_id AND (c.captain_profile_id=auth.uid() OR c.owner_profile_id=auth.uid() OR is_admin(auth.uid()))))
  WITH CHECK (EXISTS (SELECT 1 FROM clans c WHERE c.id=player_scouting_notes.clan_id AND (c.captain_profile_id=auth.uid() OR c.owner_profile_id=auth.uid() OR is_admin(auth.uid()))));

CREATE TABLE IF NOT EXISTS public.clan_trophies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clan_id uuid NOT NULL REFERENCES public.clans(id) ON DELETE CASCADE,
  competition_name text NOT NULL,
  placement text,
  year integer,
  description text,
  awarded_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.clan_trophies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "troph public read" ON public.clan_trophies FOR SELECT USING (true);
CREATE POLICY "troph admin write" ON public.clan_trophies FOR ALL USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

-- ============================================================
-- 14. CLAN MATCH ROOMS (friendly + tournament)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.clan_match_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_type text NOT NULL DEFAULT 'friendly',
  tournament_id uuid,
  clan_a_id uuid NOT NULL REFERENCES public.clans(id) ON DELETE CASCADE,
  clan_b_id uuid NOT NULL REFERENCES public.clans(id) ON DELETE CASCADE,
  team_a_id uuid REFERENCES public.clan_teams(id) ON DELETE SET NULL,
  team_b_id uuid REFERENCES public.clan_teams(id) ON DELETE SET NULL,
  player_count integer NOT NULL DEFAULT 11,
  status text NOT NULL DEFAULT 'proposed',
  scheduled_at timestamptz,
  lineup_deadline timestamptz,
  stream_url text,
  vod_url text,
  notes text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.clan_match_rooms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rooms public read" ON public.clan_match_rooms FOR SELECT USING (true);
CREATE POLICY "rooms captain insert" ON public.clan_match_rooms FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM clans c WHERE (c.id=clan_match_rooms.clan_a_id OR c.id=clan_match_rooms.clan_b_id) AND (c.captain_profile_id=auth.uid() OR c.owner_profile_id=auth.uid())));
CREATE POLICY "rooms involved update" ON public.clan_match_rooms FOR UPDATE
  USING (EXISTS (SELECT 1 FROM clans c WHERE (c.id=clan_match_rooms.clan_a_id OR c.id=clan_match_rooms.clan_b_id) AND (c.captain_profile_id=auth.uid() OR c.owner_profile_id=auth.uid())) OR is_admin(auth.uid()));

CREATE TABLE IF NOT EXISTS public.clan_match_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES public.clan_match_rooms(id) ON DELETE CASCADE,
  submitted_by uuid NOT NULL,
  submitting_clan_id uuid NOT NULL,
  score_a integer NOT NULL,
  score_b integer NOT NULL,
  evidence_url text,
  notes text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.clan_match_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cmres public read" ON public.clan_match_results FOR SELECT USING (true);
CREATE POLICY "cmres authed insert" ON public.clan_match_results FOR INSERT TO authenticated WITH CHECK (auth.uid() = submitted_by);
CREATE POLICY "cmres admin update" ON public.clan_match_results FOR UPDATE USING (is_admin(auth.uid()));

CREATE TABLE IF NOT EXISTS public.clan_match_disputes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES public.clan_match_rooms(id) ON DELETE CASCADE,
  opened_by uuid NOT NULL,
  reason text NOT NULL,
  evidence_url text,
  status text NOT NULL DEFAULT 'open',
  resolution text,
  resolved_by uuid,
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.clan_match_disputes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cdisp public read" ON public.clan_match_disputes FOR SELECT USING (true);
CREATE POLICY "cdisp authed insert" ON public.clan_match_disputes FOR INSERT TO authenticated WITH CHECK (auth.uid() = opened_by);
CREATE POLICY "cdisp admin update" ON public.clan_match_disputes FOR UPDATE USING (is_admin(auth.uid()));

-- ============================================================
-- 15. STRIPE TABLES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.stripe_customers (
  user_id uuid PRIMARY KEY,
  customer_id text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.stripe_customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "stripe self read" ON public.stripe_customers FOR SELECT USING (auth.uid() = user_id OR is_admin(auth.uid()));

CREATE TABLE IF NOT EXISTS public.clan_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clan_id uuid NOT NULL REFERENCES public.clans(id) ON DELETE CASCADE,
  stripe_subscription_id text UNIQUE,
  stripe_customer_id text,
  status text NOT NULL DEFAULT 'inactive',
  plan text NOT NULL DEFAULT 'pro',
  current_period_end timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.clan_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sub public read" ON public.clan_subscriptions FOR SELECT USING (true);
CREATE POLICY "sub admin write" ON public.clan_subscriptions FOR ALL USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

CREATE TABLE IF NOT EXISTS public.tournament_entry_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid NOT NULL,
  payer_user_id uuid NOT NULL,
  registration_id uuid,
  stripe_session_id text UNIQUE,
  amount_cents integer NOT NULL,
  currency text NOT NULL DEFAULT 'usd',
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.tournament_entry_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pay self read" ON public.tournament_entry_payments FOR SELECT USING (auth.uid() = payer_user_id OR is_admin(auth.uid()));
CREATE POLICY "pay authed insert" ON public.tournament_entry_payments FOR INSERT TO authenticated WITH CHECK (auth.uid() = payer_user_id);

-- ============================================================
-- 16. RE-SEED COMMUNITIES (Global + countries + regions)
-- ============================================================
INSERT INTO public.communities (slug, name, description, scope, region, continent, country, is_official) VALUES
  ('global','Global','The home of every KAFConnect player. Every member belongs here by default.','global',NULL,NULL,NULL,true),
  ('mena','MENA','Middle East & North Africa esports hub.','region','MENA',NULL,NULL,true),
  ('africa','Africa','Pan-African eFootball community.','continent',NULL,'Africa',NULL,true),
  ('europe','Europe','European eFootball community.','continent',NULL,'Europe',NULL,true),
  ('asia','Asia','Asian eFootball community.','continent',NULL,'Asia',NULL,true),
  ('americas','Americas','North & South America eFootball community.','continent',NULL,'Americas',NULL,true),
  ('nigeria','Nigeria','Official KAFConnect community for Nigeria.','country',NULL,'Africa','Nigeria',true),
  ('india','India','Official KAFConnect community for India.','country',NULL,'Asia','India',true),
  ('turkiye','TÃ¼rkiye','Official KAFConnect community for TÃ¼rkiye.','country',NULL,'Europe','TÃ¼rkiye',true),
  ('egypt','Egypt','Official KAFConnect community for Egypt.','country','MENA','Africa','Egypt',true),
  ('morocco','Morocco','Official KAFConnect community for Morocco.','country','MENA','Africa','Morocco',true),
  ('senegal','Senegal','Official KAFConnect community for Senegal.','country',NULL,'Africa','Senegal',true);


-- === 20260502130855_2d70c213-0d1e-4639-ad10-d2bb247c3df8.sql ===
-- Clan create tokens
CREATE TABLE public.clan_create_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token text NOT NULL UNIQUE,
  label text,
  max_uses integer NOT NULL DEFAULT 1,
  uses integer NOT NULL DEFAULT 0,
  expires_at timestamptz,
  used_at timestamptz,
  used_by uuid,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.clan_create_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tokens super read all" ON public.clan_create_tokens FOR SELECT USING (has_role(auth.uid(),'super_admin'));
CREATE POLICY "tokens public read by exact id" ON public.clan_create_tokens FOR SELECT USING (true);
CREATE POLICY "tokens super write" ON public.clan_create_tokens FOR ALL USING (has_role(auth.uid(),'super_admin')) WITH CHECK (has_role(auth.uid(),'super_admin'));

-- Coaches table
CREATE TABLE public.clan_coaches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clan_id uuid NOT NULL,
  profile_id uuid,
  name text NOT NULL,
  title text DEFAULT 'Coach',
  head_coach boolean NOT NULL DEFAULT false,
  bio text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.clan_coaches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "coaches public read" ON public.clan_coaches FOR SELECT USING (true);
CREATE POLICY "coaches captain manage" ON public.clan_coaches FOR ALL
  USING (EXISTS (SELECT 1 FROM clans c WHERE c.id = clan_coaches.clan_id AND (c.captain_profile_id = auth.uid() OR c.owner_profile_id = auth.uid() OR is_admin(auth.uid()))))
  WITH CHECK (EXISTS (SELECT 1 FROM clans c WHERE c.id = clan_coaches.clan_id AND (c.captain_profile_id = auth.uid() OR c.owner_profile_id = auth.uid() OR is_admin(auth.uid()))));

-- Community coach limit
ALTER TABLE public.communities ADD COLUMN IF NOT EXISTS max_coaches_per_clan integer NOT NULL DEFAULT 2;

-- Token consume function
CREATE OR REPLACE FUNCTION public.consume_clan_token(_token text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  t public.clan_create_tokens%ROWTYPE;
BEGIN
  SELECT * INTO t FROM public.clan_create_tokens WHERE token = _token FOR UPDATE;
  IF NOT FOUND THEN RETURN jsonb_build_object('ok', false, 'error', 'Invalid token'); END IF;
  IF t.expires_at IS NOT NULL AND t.expires_at < now() THEN RETURN jsonb_build_object('ok', false, 'error', 'Token expired'); END IF;
  IF t.uses >= t.max_uses THEN RETURN jsonb_build_object('ok', false, 'error', 'Token already used'); END IF;
  UPDATE public.clan_create_tokens SET uses = uses + 1, used_at = now(), used_by = auth.uid() WHERE id = t.id;
  RETURN jsonb_build_object('ok', true);
END;
$$;

-- Auto-create clan match rooms for tournament matches
CREATE OR REPLACE FUNCTION public.auto_create_clan_match_room()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deadline timestamptz;
BEGIN
  IF NEW.clan1_id IS NOT NULL AND NEW.clan2_id IS NOT NULL AND NEW.tournament_id IS NOT NULL THEN
    deadline := COALESCE(NEW.scheduled_at, now() + interval '7 days') - interval '4 hours';
    INSERT INTO public.clan_match_rooms (clan_a_id, clan_b_id, tournament_id, match_type, scheduled_at, lineup_deadline, status, created_by)
    VALUES (NEW.clan1_id, NEW.clan2_id, NEW.tournament_id, 'tournament', NEW.scheduled_at, deadline, 'scheduled', NULL);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auto_clan_room ON public.matches;
CREATE TRIGGER trg_auto_clan_room
AFTER INSERT ON public.matches
FOR EACH ROW EXECUTE FUNCTION public.auto_create_clan_match_room();

-- === 20260502131757_db5d5b1d-9535-4094-89fe-0b66d08ea2fa.sql ===
-- ============ STORAGE ============
INSERT INTO storage.buckets (id, name, public) VALUES ('screen-recordings', 'screen-recordings', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "screenrec authed upload" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'screen-recordings' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "screenrec read involved" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'screen-recordings');

-- ============ NEW COLUMNS ============
ALTER TABLE public.clan_match_rooms
  ADD COLUMN IF NOT EXISTS result_deadline timestamptz,
  ADD COLUMN IF NOT EXISTS lineup_a_locked boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS lineup_b_locked boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS subs_allowed integer NOT NULL DEFAULT 3,
  ADD COLUMN IF NOT EXISTS referee_user_id uuid,
  ADD COLUMN IF NOT EXISTS winner_clan_id uuid,
  ADD COLUMN IF NOT EXISTS finalized_at timestamptz;

ALTER TABLE public.clan_match_results
  ADD COLUMN IF NOT EXISTS screen_recording_url text;

ALTER TABLE public.tournaments
  ADD COLUMN IF NOT EXISTS subs_allowed integer NOT NULL DEFAULT 3,
  ADD COLUMN IF NOT EXISTS screen_recording_required boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS lineup_lock_mode text NOT NULL DEFAULT 'open_when_both_submit',
  ADD COLUMN IF NOT EXISTS result_deadline_hours integer NOT NULL DEFAULT 48;

-- ============ PLAYER vs PLAYER SUB-ROOMS ============
CREATE TABLE IF NOT EXISTS public.clan_match_player_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL,
  slot_index integer NOT NULL,
  clan_a_player_id uuid,
  clan_b_player_id uuid,
  score_a integer,
  score_b integer,
  screenshot_url text,
  screen_recording_url text,
  submitted_by uuid,
  status text NOT NULL DEFAULT 'pending',
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.clan_match_player_rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pvp public read" ON public.clan_match_player_rooms FOR SELECT USING (true);
CREATE POLICY "pvp player submit" ON public.clan_match_player_rooms FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM players p WHERE p.profile_id = auth.uid() AND (p.id = clan_match_player_rooms.clan_a_player_id OR p.id = clan_match_player_rooms.clan_b_player_id))
    OR EXISTS (SELECT 1 FROM clan_match_rooms r JOIN clans c ON (c.id = r.clan_a_id OR c.id = r.clan_b_id)
      WHERE r.id = clan_match_player_rooms.room_id AND (c.captain_profile_id = auth.uid() OR c.owner_profile_id = auth.uid()))
    OR EXISTS (SELECT 1 FROM clan_match_rooms r WHERE r.id = clan_match_player_rooms.room_id AND r.referee_user_id = auth.uid())
    OR is_admin(auth.uid())
  );
CREATE POLICY "pvp system insert" ON public.clan_match_player_rooms FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL OR true);

-- ============ WALKOVERS ============
CREATE TABLE IF NOT EXISTS public.clan_match_walkovers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL,
  requested_by uuid NOT NULL,
  requesting_clan_id uuid NOT NULL,
  reason text NOT NULL,
  evidence_url text,
  status text NOT NULL DEFAULT 'pending',
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.clan_match_walkovers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "wo public read" ON public.clan_match_walkovers FOR SELECT USING (true);
CREATE POLICY "wo authed insert" ON public.clan_match_walkovers FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = requested_by);
CREATE POLICY "wo ref/admin update" ON public.clan_match_walkovers FOR UPDATE
  USING (is_admin(auth.uid()) OR EXISTS (SELECT 1 FROM clan_match_rooms r WHERE r.id = clan_match_walkovers.room_id AND r.referee_user_id = auth.uid()));

-- ============ SCRIM CHALLENGES ============
CREATE TABLE IF NOT EXISTS public.scrim_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  posting_clan_id uuid NOT NULL,
  posted_by uuid,
  preferred_time timestamptz,
  region text,
  player_count integer NOT NULL DEFAULT 11,
  notes text,
  status text NOT NULL DEFAULT 'open',
  accepted_clan_id uuid,
  accepted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.scrim_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "scrim public read" ON public.scrim_challenges FOR SELECT USING (true);
CREATE POLICY "scrim captain insert" ON public.scrim_challenges FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM clans c WHERE c.id = posting_clan_id AND (c.captain_profile_id = auth.uid() OR c.owner_profile_id = auth.uid())));
CREATE POLICY "scrim captain update" ON public.scrim_challenges FOR UPDATE
  USING (EXISTS (SELECT 1 FROM clans c WHERE (c.id = posting_clan_id OR c.id = accepted_clan_id) AND (c.captain_profile_id = auth.uid() OR c.owner_profile_id = auth.uid())) OR is_admin(auth.uid()));

-- ============ COMMUNITY RANKINGS ============
CREATE TABLE IF NOT EXISTS public.community_player_rankings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id uuid NOT NULL,
  player_id uuid NOT NULL,
  season text NOT NULL DEFAULT 'lifetime',
  points integer NOT NULL DEFAULT 0,
  matches_played integer NOT NULL DEFAULT 0,
  wins integer NOT NULL DEFAULT 0,
  losses integer NOT NULL DEFAULT 0,
  goals_scored integer NOT NULL DEFAULT 0,
  goals_conceded integer NOT NULL DEFAULT 0,
  manual_adjustment integer NOT NULL DEFAULT 0,
  notes text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (community_id, player_id, season)
);
ALTER TABLE public.community_player_rankings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cpr public read" ON public.community_player_rankings FOR SELECT USING (true);
CREATE POLICY "cpr admin write" ON public.community_player_rankings FOR ALL
  USING (is_admin(auth.uid()) OR is_community_admin(auth.uid(), community_id))
  WITH CHECK (is_admin(auth.uid()) OR is_community_admin(auth.uid(), community_id));

CREATE TABLE IF NOT EXISTS public.community_clan_rankings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id uuid NOT NULL,
  clan_id uuid NOT NULL,
  season text NOT NULL DEFAULT 'lifetime',
  points integer NOT NULL DEFAULT 0,
  matches_played integer NOT NULL DEFAULT 0,
  wins integer NOT NULL DEFAULT 0,
  losses integer NOT NULL DEFAULT 0,
  draws integer NOT NULL DEFAULT 0,
  goals_scored integer NOT NULL DEFAULT 0,
  goals_conceded integer NOT NULL DEFAULT 0,
  manual_adjustment integer NOT NULL DEFAULT 0,
  notes text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (community_id, clan_id, season)
);
ALTER TABLE public.community_clan_rankings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ccr public read" ON public.community_clan_rankings FOR SELECT USING (true);
CREATE POLICY "ccr admin write" ON public.community_clan_rankings FOR ALL
  USING (is_admin(auth.uid()) OR is_community_admin(auth.uid(), community_id))
  WITH CHECK (is_admin(auth.uid()) OR is_community_admin(auth.uid(), community_id));

-- ============ TRANSFER WINDOWS ============
CREATE TABLE IF NOT EXISTS public.transfer_windows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id uuid,
  name text NOT NULL,
  opens_at timestamptz NOT NULL,
  closes_at timestamptz NOT NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.transfer_windows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tw public read" ON public.transfer_windows FOR SELECT USING (true);
CREATE POLICY "tw admin write" ON public.transfer_windows FOR ALL
  USING (is_admin(auth.uid()) OR (community_id IS NOT NULL AND is_community_admin(auth.uid(), community_id)))
  WITH CHECK (is_admin(auth.uid()) OR (community_id IS NOT NULL AND is_community_admin(auth.uid(), community_id)));

-- ============ ELIGIBILITY OVERRIDES ============
CREATE TABLE IF NOT EXISTS public.eligibility_overrides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid NOT NULL,
  tournament_id uuid,
  community_id uuid,
  reason text NOT NULL,
  granted_by uuid,
  granted_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz
);
ALTER TABLE public.eligibility_overrides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "elig public read" ON public.eligibility_overrides FOR SELECT USING (true);
CREATE POLICY "elig admin write" ON public.eligibility_overrides FOR ALL
  USING (is_admin(auth.uid()) OR (community_id IS NOT NULL AND is_community_admin(auth.uid(), community_id)))
  WITH CHECK (is_admin(auth.uid()) OR (community_id IS NOT NULL AND is_community_admin(auth.uid(), community_id)));

-- ============ INVITE TOKEN SECURITY ============
DROP POLICY IF EXISTS "tokens public read by exact id" ON public.clan_create_tokens;
DROP POLICY IF EXISTS "tokens super read all" ON public.clan_create_tokens;
DROP POLICY IF EXISTS "tokens super write" ON public.clan_create_tokens;
CREATE POLICY "tokens super read" ON public.clan_create_tokens FOR SELECT
  USING (has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "tokens super write" ON public.clan_create_tokens FOR ALL
  USING (has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

CREATE OR REPLACE FUNCTION public.validate_clan_token(_token text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE t public.clan_create_tokens%ROWTYPE;
BEGIN
  SELECT * INTO t FROM public.clan_create_tokens WHERE token = _token;
  IF NOT FOUND THEN RETURN jsonb_build_object('ok', false, 'error', 'Invalid token'); END IF;
  IF t.expires_at IS NOT NULL AND t.expires_at < now() THEN RETURN jsonb_build_object('ok', false, 'error', 'Expired'); END IF;
  IF t.uses >= t.max_uses THEN RETURN jsonb_build_object('ok', false, 'error', 'Already used'); END IF;
  RETURN jsonb_build_object('ok', true, 'label', t.label, 'uses', t.uses, 'max_uses', t.max_uses, 'expires_at', t.expires_at);
END;
$$;
REVOKE EXECUTE ON FUNCTION public.validate_clan_token(text) FROM public;
GRANT EXECUTE ON FUNCTION public.validate_clan_token(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.consume_clan_token(text) TO authenticated;

-- ============ AUTO-LOCK LINEUPS + SPAWN PVP ROOMS ============
CREATE OR REPLACE FUNCTION public.auto_lock_lineups()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  room public.clan_match_rooms%ROWTYPE;
  other_lineup public.match_lineups%ROWTYPE;
  starters_a jsonb;
  starters_b jsonb;
  i integer;
BEGIN
  IF NEW.match_id IS NULL THEN RETURN NEW; END IF;
  SELECT * INTO room FROM public.clan_match_rooms WHERE id = NEW.match_id;
  IF NOT FOUND THEN RETURN NEW; END IF;

  -- Mark which side just submitted
  IF NEW.clan_id = room.clan_a_id THEN
    UPDATE public.clan_match_rooms SET lineup_a_locked = true WHERE id = room.id;
  ELSIF NEW.clan_id = room.clan_b_id THEN
    UPDATE public.clan_match_rooms SET lineup_b_locked = true WHERE id = room.id;
  END IF;

  -- Re-read room
  SELECT * INTO room FROM public.clan_match_rooms WHERE id = NEW.match_id;

  IF room.lineup_a_locked AND room.lineup_b_locked THEN
    -- Lock both lineup rows
    UPDATE public.match_lineups SET locked = true, locked_at = now() WHERE match_id = room.id;
    UPDATE public.clan_match_rooms SET status = 'live' WHERE id = room.id AND status IN ('scheduled','proposed');

    -- Spawn 1v1 sub rooms only if not already spawned
    IF NOT EXISTS (SELECT 1 FROM public.clan_match_player_rooms WHERE room_id = room.id) THEN
      SELECT starters INTO starters_a FROM public.match_lineups WHERE match_id = room.id AND clan_id = room.clan_a_id LIMIT 1;
      SELECT starters INTO starters_b FROM public.match_lineups WHERE match_id = room.id AND clan_id = room.clan_b_id LIMIT 1;
      IF starters_a IS NOT NULL AND starters_b IS NOT NULL THEN
        FOR i IN 0..LEAST(jsonb_array_length(starters_a), jsonb_array_length(starters_b)) - 1 LOOP
          INSERT INTO public.clan_match_player_rooms (room_id, slot_index, clan_a_player_id, clan_b_player_id)
          VALUES (
            room.id, i,
            NULLIF(starters_a->i->>'player_id','')::uuid,
            NULLIF(starters_b->i->>'player_id','')::uuid
          );
        END LOOP;
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auto_lock_lineups ON public.match_lineups;
CREATE TRIGGER trg_auto_lock_lineups
AFTER INSERT OR UPDATE ON public.match_lineups
FOR EACH ROW EXECUTE FUNCTION public.auto_lock_lineups();

-- ============ APPLY APPROVED CLAN MATCH RESULT ============
CREATE OR REPLACE FUNCTION public.apply_clan_match_result()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  room public.clan_match_rooms%ROWTYPE;
  winner_id uuid;
  loser_id uuid;
BEGIN
  IF NEW.status <> 'approved' OR (TG_OP = 'UPDATE' AND OLD.status = 'approved') THEN RETURN NEW; END IF;
  SELECT * INTO room FROM public.clan_match_rooms WHERE id = NEW.room_id;
  IF NOT FOUND THEN RETURN NEW; END IF;

  IF NEW.score_a > NEW.score_b THEN winner_id := room.clan_a_id; loser_id := room.clan_b_id;
  ELSIF NEW.score_b > NEW.score_a THEN winner_id := room.clan_b_id; loser_id := room.clan_a_id;
  END IF;

  IF winner_id IS NOT NULL THEN
    UPDATE public.clans SET wins = wins + 1, elo = elo + 25 WHERE id = winner_id;
    UPDATE public.clans SET losses = losses + 1, elo = GREATEST(elo - 25, 0) WHERE id = loser_id;
    INSERT INTO public.clan_elo_log (clan_id, delta, new_elo, match_id, reason)
      SELECT id, 25, elo, room.id, 'win vs clan match' FROM public.clans WHERE id = winner_id;
    INSERT INTO public.clan_elo_log (clan_id, delta, new_elo, match_id, reason)
      SELECT id, -25, elo, room.id, 'loss vs clan match' FROM public.clans WHERE id = loser_id;
  END IF;

  UPDATE public.clan_match_rooms SET status = 'completed', winner_clan_id = winner_id, finalized_at = now() WHERE id = room.id;

  -- Audit
  INSERT INTO public.clan_audit_logs (clan_id, action, reason, new_value)
    VALUES (room.clan_a_id, 'match_result_approved', NEW.notes, jsonb_build_object('score_a', NEW.score_a, 'score_b', NEW.score_b, 'winner', winner_id));
  INSERT INTO public.clan_audit_logs (clan_id, action, reason, new_value)
    VALUES (room.clan_b_id, 'match_result_approved', NEW.notes, jsonb_build_object('score_a', NEW.score_a, 'score_b', NEW.score_b, 'winner', winner_id));

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_apply_clan_result ON public.clan_match_results;
CREATE TRIGGER trg_apply_clan_result
AFTER INSERT OR UPDATE ON public.clan_match_results
FOR EACH ROW EXECUTE FUNCTION public.apply_clan_match_result();

-- ============ APPLY APPROVED PVP RESULT (player stats) ============
CREATE OR REPLACE FUNCTION public.apply_pvp_result()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  winner_pid uuid;
  loser_pid uuid;
BEGIN
  IF NEW.status <> 'approved' OR (TG_OP = 'UPDATE' AND OLD.status = 'approved') THEN RETURN NEW; END IF;
  IF NEW.score_a IS NULL OR NEW.score_b IS NULL THEN RETURN NEW; END IF;

  IF NEW.score_a > NEW.score_b THEN winner_pid := NEW.clan_a_player_id; loser_pid := NEW.clan_b_player_id;
  ELSIF NEW.score_b > NEW.score_a THEN winner_pid := NEW.clan_b_player_id; loser_pid := NEW.clan_a_player_id;
  END IF;

  IF winner_pid IS NOT NULL THEN
    UPDATE public.players SET wins = wins + 1, goals_scored = goals_scored + GREATEST(NEW.score_a, NEW.score_b),
      goals_conceded = goals_conceded + LEAST(NEW.score_a, NEW.score_b), ranking_points = ranking_points + 15
      WHERE id = winner_pid;
    UPDATE public.players SET losses = losses + 1, goals_scored = goals_scored + LEAST(NEW.score_a, NEW.score_b),
      goals_conceded = goals_conceded + GREATEST(NEW.score_a, NEW.score_b), ranking_points = GREATEST(ranking_points - 15, 0)
      WHERE id = loser_pid;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_apply_pvp ON public.clan_match_player_rooms;
CREATE TRIGGER trg_apply_pvp
AFTER INSERT OR UPDATE ON public.clan_match_player_rooms
FOR EACH ROW EXECUTE FUNCTION public.apply_pvp_result();

-- ============ APPLY WALKOVER ============
CREATE OR REPLACE FUNCTION public.apply_walkover()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  room public.clan_match_rooms%ROWTYPE;
  loser_id uuid;
BEGIN
  IF NEW.status <> 'approved' OR (TG_OP = 'UPDATE' AND OLD.status = 'approved') THEN RETURN NEW; END IF;
  SELECT * INTO room FROM public.clan_match_rooms WHERE id = NEW.room_id;
  IF NOT FOUND THEN RETURN NEW; END IF;
  loser_id := CASE WHEN NEW.requesting_clan_id = room.clan_a_id THEN room.clan_b_id ELSE room.clan_a_id END;

  UPDATE public.clans SET wins = wins + 1, elo = elo + 15 WHERE id = NEW.requesting_clan_id;
  UPDATE public.clans SET losses = losses + 1, elo = GREATEST(elo - 15, 0) WHERE id = loser_id;
  UPDATE public.clan_match_rooms SET status = 'walkover', winner_clan_id = NEW.requesting_clan_id, finalized_at = now() WHERE id = room.id;

  INSERT INTO public.clan_audit_logs (clan_id, action, reason)
    VALUES (loser_id, 'walkover_loss', NEW.reason);
  INSERT INTO public.clan_audit_logs (clan_id, action, reason)
    VALUES (NEW.requesting_clan_id, 'walkover_win', NEW.reason);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_apply_walkover ON public.clan_match_walkovers;
CREATE TRIGGER trg_apply_walkover
AFTER INSERT OR UPDATE ON public.clan_match_walkovers
FOR EACH ROW EXECUTE FUNCTION public.apply_walkover();

-- === 20260502133327_4f87b4ba-b2d9-4101-abff-7238858ad2aa.sql ===
-- ============ eFootball Mobile player profile fields ============
ALTER TABLE public.players
  ADD COLUMN IF NOT EXISTS in_game_id text,                -- eFootball Konami ID
  ADD COLUMN IF NOT EXISTS in_game_name text,              -- in-game manager/club name shown in match
  ADD COLUMN IF NOT EXISTS device text,                    -- iOS / Android / Emulator
  ADD COLUMN IF NOT EXISTS device_model text,              -- e.g. iPhone 15 Pro
  ADD COLUMN IF NOT EXISTS controller_type text DEFAULT 'touch', -- touch / classic / advanced / controller
  ADD COLUMN IF NOT EXISTS preferred_formation text DEFAULT '4-3-3',
  ADD COLUMN IF NOT EXISTS preferred_playstyle text,       -- possession / counter / tiki-taka / long-ball / pressing
  ADD COLUMN IF NOT EXISTS preferred_foot text,            -- right / left / both
  ADD COLUMN IF NOT EXISTS height_cm integer,
  ADD COLUMN IF NOT EXISTS date_of_birth date,
  ADD COLUMN IF NOT EXISTS positions text[] DEFAULT '{}',  -- secondary positions
  ADD COLUMN IF NOT EXISTS jersey_number integer,
  ADD COLUMN IF NOT EXISTS years_playing integer,
  ADD COLUMN IF NOT EXISTS division text,                  -- eFootball league/division (e.g. Div 1)
  ADD COLUMN IF NOT EXISTS efootball_rating integer,       -- self/community rating 1-100
  ADD COLUMN IF NOT EXISTS social_links jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS languages text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS timezone text,
  ADD COLUMN IF NOT EXISTS availability_hours text,        -- e.g. "weekdays 18-22 UTC"
  ADD COLUMN IF NOT EXISTS looking_for_clan boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS achievements jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS signature_players text[] DEFAULT '{}',  -- favorite eFootball cards used
  ADD COLUMN IF NOT EXISTS career_highlights text,
  ADD COLUMN IF NOT EXISTS coaching_available boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS streamer_url text,
  ADD COLUMN IF NOT EXISTS verified_efootball boolean NOT NULL DEFAULT false;

-- Lock platform to eFootball Mobile only (default + check)
ALTER TABLE public.players ALTER COLUMN main_game SET DEFAULT 'eFootball Mobile';
UPDATE public.players SET main_game = 'eFootball Mobile' WHERE main_game IS NULL OR main_game <> 'eFootball Mobile';
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.constraint_column_usage WHERE table_name='players' AND constraint_name='players_main_game_efm') THEN
    ALTER TABLE public.players ADD CONSTRAINT players_main_game_efm CHECK (main_game = 'eFootball Mobile');
  END IF;
END $$;

-- Indexes for filtering
CREATE INDEX IF NOT EXISTS idx_players_looking_for_clan ON public.players(looking_for_clan) WHERE looking_for_clan = true;
CREATE INDEX IF NOT EXISTS idx_players_device ON public.players(device);
CREATE INDEX IF NOT EXISTS idx_players_division ON public.players(division);

-- === 20260502134838_86818498-3255-4de4-9d62-96fa677eac12.sql ===
-- ============ TOURNAMENT CREATOR GRANTS ============
CREATE TABLE IF NOT EXISTS public.tournament_creator_grants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  community_id uuid,
  granted_by uuid,
  granted_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  notes text
);
ALTER TABLE public.tournament_creator_grants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tcg public read" ON public.tournament_creator_grants;
DROP POLICY IF EXISTS "tcg admin write" ON public.tournament_creator_grants;
CREATE POLICY "tcg public read" ON public.tournament_creator_grants FOR SELECT USING (true);
CREATE POLICY "tcg admin write" ON public.tournament_creator_grants FOR ALL
  USING (is_admin(auth.uid()) OR (community_id IS NOT NULL AND is_community_admin(auth.uid(), community_id)))
  WITH CHECK (is_admin(auth.uid()) OR (community_id IS NOT NULL AND is_community_admin(auth.uid(), community_id)));

CREATE OR REPLACE FUNCTION public.can_create_tournaments(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT is_admin(_user_id) OR EXISTS(
    SELECT 1 FROM public.tournament_creator_grants
    WHERE user_id = _user_id AND (expires_at IS NULL OR expires_at > now())
  );
$$;

-- ============ EXTEND TOURNAMENTS ============
ALTER TABLE public.tournaments
  ADD COLUMN IF NOT EXISTS participant_type text NOT NULL DEFAULT 'clan',
  ADD COLUMN IF NOT EXISTS coop_size int,
  ADD COLUMN IF NOT EXISTS series_key text,
  ADD COLUMN IF NOT EXISTS season text,
  ADD COLUMN IF NOT EXISTS visibility text NOT NULL DEFAULT 'public',
  ADD COLUMN IF NOT EXISTS registration_opens_at timestamptz,
  ADD COLUMN IF NOT EXISTS registration_closes_at timestamptz,
  ADD COLUMN IF NOT EXISTS check_in_minutes int DEFAULT 30,
  ADD COLUMN IF NOT EXISTS rules_md text,
  ADD COLUMN IF NOT EXISTS prize_pool_cents int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'EUR',
  ADD COLUMN IF NOT EXISTS entry_fee_cents int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS settings jsonb NOT NULL DEFAULT '{}'::jsonb;

-- ============ STAGES ============
CREATE TABLE IF NOT EXISTS public.tournament_stages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid NOT NULL,
  name text NOT NULL,
  format text NOT NULL,
  order_index int NOT NULL DEFAULT 0,
  settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'pending',
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.tournament_stages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "stages public read" ON public.tournament_stages;
DROP POLICY IF EXISTS "stages organizer write" ON public.tournament_stages;
CREATE POLICY "stages public read" ON public.tournament_stages FOR SELECT USING (true);
CREATE POLICY "stages organizer write" ON public.tournament_stages FOR ALL
  USING (EXISTS(SELECT 1 FROM public.tournaments t WHERE t.id = tournament_id AND (t.created_by = auth.uid() OR is_admin(auth.uid()) OR (t.community_id IS NOT NULL AND is_community_admin(auth.uid(), t.community_id)))))
  WITH CHECK (EXISTS(SELECT 1 FROM public.tournaments t WHERE t.id = tournament_id AND (t.created_by = auth.uid() OR is_admin(auth.uid()) OR (t.community_id IS NOT NULL AND is_community_admin(auth.uid(), t.community_id)))));

-- ============ GROUPS ============
CREATE TABLE IF NOT EXISTS public.tournament_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stage_id uuid NOT NULL,
  name text NOT NULL,
  order_index int NOT NULL DEFAULT 0
);
ALTER TABLE public.tournament_groups ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tgroups public read" ON public.tournament_groups;
DROP POLICY IF EXISTS "tgroups organizer write" ON public.tournament_groups;
CREATE POLICY "tgroups public read" ON public.tournament_groups FOR SELECT USING (true);
CREATE POLICY "tgroups organizer write" ON public.tournament_groups FOR ALL
  USING (EXISTS(SELECT 1 FROM public.tournament_stages s JOIN public.tournaments t ON t.id = s.tournament_id WHERE s.id = stage_id AND (t.created_by = auth.uid() OR is_admin(auth.uid()) OR (t.community_id IS NOT NULL AND is_community_admin(auth.uid(), t.community_id)))))
  WITH CHECK (EXISTS(SELECT 1 FROM public.tournament_stages s JOIN public.tournaments t ON t.id = s.tournament_id WHERE s.id = stage_id AND (t.created_by = auth.uid() OR is_admin(auth.uid()) OR (t.community_id IS NOT NULL AND is_community_admin(auth.uid(), t.community_id)))));

-- ============ EXTEND REGISTRATIONS ============
ALTER TABLE public.tournament_registrations
  ADD COLUMN IF NOT EXISTS coop_team_id uuid,
  ADD COLUMN IF NOT EXISTS display_name text,
  ADD COLUMN IF NOT EXISTS seed int,
  ADD COLUMN IF NOT EXISTS group_id uuid,
  ADD COLUMN IF NOT EXISTS checked_in boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS paid boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS metadata jsonb NOT NULL DEFAULT '{}'::jsonb;

-- ============ CO-OP TEAMS ============
CREATE TABLE IF NOT EXISTS public.coop_teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  tag text,
  size int NOT NULL DEFAULT 2,
  captain_profile_id uuid,
  logo_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.coop_teams ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "coop public read" ON public.coop_teams;
DROP POLICY IF EXISTS "coop authed insert" ON public.coop_teams;
DROP POLICY IF EXISTS "coop captain update" ON public.coop_teams;
CREATE POLICY "coop public read" ON public.coop_teams FOR SELECT USING (true);
CREATE POLICY "coop authed insert" ON public.coop_teams FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "coop captain update" ON public.coop_teams FOR UPDATE USING (captain_profile_id = auth.uid() OR is_admin(auth.uid()));

CREATE TABLE IF NOT EXISTS public.coop_team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  player_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'player',
  joined_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.coop_team_members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "coopm public read" ON public.coop_team_members;
DROP POLICY IF EXISTS "coopm captain manage" ON public.coop_team_members;
CREATE POLICY "coopm public read" ON public.coop_team_members FOR SELECT USING (true);
CREATE POLICY "coopm captain manage" ON public.coop_team_members FOR ALL
  USING (EXISTS(SELECT 1 FROM public.coop_teams t WHERE t.id = team_id AND (t.captain_profile_id = auth.uid() OR is_admin(auth.uid()))))
  WITH CHECK (EXISTS(SELECT 1 FROM public.coop_teams t WHERE t.id = team_id AND (t.captain_profile_id = auth.uid() OR is_admin(auth.uid()))));

-- ============ BRACKET MATCHES ============
CREATE TABLE IF NOT EXISTS public.bracket_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid NOT NULL,
  stage_id uuid NOT NULL,
  group_id uuid,
  round int NOT NULL,
  match_index int NOT NULL,
  bracket_side text NOT NULL DEFAULT 'main',
  best_of int NOT NULL DEFAULT 1,
  participant_a_id uuid,
  participant_b_id uuid,
  winner_id uuid,
  score_a int,
  score_b int,
  status text NOT NULL DEFAULT 'pending',
  scheduled_at timestamptz,
  reported_by uuid,
  reported_at timestamptz,
  evidence_url text,
  next_match_id uuid,
  next_loser_match_id uuid,
  clan_match_room_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_bracket_matches_stage ON public.bracket_matches(stage_id);
CREATE INDEX IF NOT EXISTS idx_bracket_matches_tournament ON public.bracket_matches(tournament_id);
ALTER TABLE public.bracket_matches ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "bm public read" ON public.bracket_matches;
DROP POLICY IF EXISTS "bm organizer write" ON public.bracket_matches;
CREATE POLICY "bm public read" ON public.bracket_matches FOR SELECT USING (true);
CREATE POLICY "bm organizer write" ON public.bracket_matches FOR ALL
  USING (EXISTS(SELECT 1 FROM public.tournaments t WHERE t.id = tournament_id AND (t.created_by = auth.uid() OR is_admin(auth.uid()) OR (t.community_id IS NOT NULL AND is_community_admin(auth.uid(), t.community_id)))))
  WITH CHECK (EXISTS(SELECT 1 FROM public.tournaments t WHERE t.id = tournament_id AND (t.created_by = auth.uid() OR is_admin(auth.uid()) OR (t.community_id IS NOT NULL AND is_community_admin(auth.uid(), t.community_id)))));

-- ============ STANDINGS ============
CREATE TABLE IF NOT EXISTS public.tournament_standings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stage_id uuid NOT NULL,
  group_id uuid,
  participant_id uuid NOT NULL,
  matches_played int NOT NULL DEFAULT 0,
  wins int NOT NULL DEFAULT 0,
  draws int NOT NULL DEFAULT 0,
  losses int NOT NULL DEFAULT 0,
  goals_for int NOT NULL DEFAULT 0,
  goals_against int NOT NULL DEFAULT 0,
  points int NOT NULL DEFAULT 0,
  tiebreaker numeric NOT NULL DEFAULT 0,
  rank int,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_standings_stage ON public.tournament_standings(stage_id);
ALTER TABLE public.tournament_standings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "stand public read" ON public.tournament_standings;
DROP POLICY IF EXISTS "stand organizer write" ON public.tournament_standings;
CREATE POLICY "stand public read" ON public.tournament_standings FOR SELECT USING (true);
CREATE POLICY "stand organizer write" ON public.tournament_standings FOR ALL
  USING (EXISTS(SELECT 1 FROM public.tournament_stages s JOIN public.tournaments t ON t.id = s.tournament_id WHERE s.id = stage_id AND (t.created_by = auth.uid() OR is_admin(auth.uid()) OR (t.community_id IS NOT NULL AND is_community_admin(auth.uid(), t.community_id)))))
  WITH CHECK (EXISTS(SELECT 1 FROM public.tournament_stages s JOIN public.tournaments t ON t.id = s.tournament_id WHERE s.id = stage_id AND (t.created_by = auth.uid() OR is_admin(auth.uid()) OR (t.community_id IS NOT NULL AND is_community_admin(auth.uid(), t.community_id)))));

-- ============ TOURNAMENT STAFF ============
CREATE TABLE IF NOT EXISTS public.tournament_staff (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid NOT NULL,
  user_id uuid NOT NULL,
  role text NOT NULL,
  permissions text[] NOT NULL DEFAULT ARRAY['view']::text[],
  assigned_by uuid,
  assigned_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.tournament_staff ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tstaff public read" ON public.tournament_staff;
DROP POLICY IF EXISTS "tstaff organizer write" ON public.tournament_staff;
CREATE POLICY "tstaff public read" ON public.tournament_staff FOR SELECT USING (true);
CREATE POLICY "tstaff organizer write" ON public.tournament_staff FOR ALL
  USING (EXISTS(SELECT 1 FROM public.tournaments t WHERE t.id = tournament_id AND (t.created_by = auth.uid() OR is_admin(auth.uid()) OR (t.community_id IS NOT NULL AND is_community_admin(auth.uid(), t.community_id)))))
  WITH CHECK (EXISTS(SELECT 1 FROM public.tournaments t WHERE t.id = tournament_id AND (t.created_by = auth.uid() OR is_admin(auth.uid()) OR (t.community_id IS NOT NULL AND is_community_admin(auth.uid(), t.community_id)))));

-- ============ MATCH REPORTS ============
CREATE TABLE IF NOT EXISTS public.bracket_match_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid NOT NULL,
  submitted_by uuid NOT NULL,
  submitting_participant_id uuid NOT NULL,
  score_a int NOT NULL,
  score_b int NOT NULL,
  evidence_url text,
  notes text,
  status text NOT NULL DEFAULT 'pending',
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.bracket_match_reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "bmr public read" ON public.bracket_match_reports;
DROP POLICY IF EXISTS "bmr authed insert" ON public.bracket_match_reports;
DROP POLICY IF EXISTS "bmr organizer update" ON public.bracket_match_reports;
CREATE POLICY "bmr public read" ON public.bracket_match_reports FOR SELECT USING (true);
CREATE POLICY "bmr authed insert" ON public.bracket_match_reports FOR INSERT TO authenticated WITH CHECK (auth.uid() = submitted_by);
CREATE POLICY "bmr organizer update" ON public.bracket_match_reports FOR UPDATE USING (
  is_admin(auth.uid())
  OR EXISTS(SELECT 1 FROM public.bracket_matches bm JOIN public.tournaments t ON t.id = bm.tournament_id WHERE bm.id = match_id AND (t.created_by = auth.uid() OR (t.community_id IS NOT NULL AND is_community_admin(auth.uid(), t.community_id))))
  OR EXISTS(SELECT 1 FROM public.bracket_matches bm JOIN public.tournament_staff ts ON ts.tournament_id = bm.tournament_id WHERE bm.id = match_id AND ts.user_id = auth.uid() AND ts.role IN ('referee','organizer','moderator'))
);

-- ============ EXTEND CLAN TOKENS ============
ALTER TABLE public.clan_create_tokens
  ADD COLUMN IF NOT EXISTS token_purpose text NOT NULL DEFAULT 'create_clan',
  ADD COLUMN IF NOT EXISTS clan_id uuid,
  ADD COLUMN IF NOT EXISTS grant_role text,
  ADD COLUMN IF NOT EXISTS grant_metadata jsonb NOT NULL DEFAULT '{}'::jsonb;

CREATE OR REPLACE FUNCTION public.consume_clan_token(_token text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  t public.clan_create_tokens%ROWTYPE;
  pid uuid;
BEGIN
  SELECT * INTO t FROM public.clan_create_tokens WHERE token = _token FOR UPDATE;
  IF NOT FOUND THEN RETURN jsonb_build_object('ok', false, 'error', 'Invalid token'); END IF;
  IF t.expires_at IS NOT NULL AND t.expires_at < now() THEN RETURN jsonb_build_object('ok', false, 'error', 'Token expired'); END IF;
  IF t.uses >= t.max_uses THEN RETURN jsonb_build_object('ok', false, 'error', 'Token already used'); END IF;

  IF t.token_purpose = 'grant_role' AND t.clan_id IS NOT NULL THEN
    IF t.grant_role IN ('owner','captain') THEN
      UPDATE public.clans
        SET captain_profile_id = CASE WHEN t.grant_role = 'captain' THEN auth.uid() ELSE captain_profile_id END,
            owner_profile_id   = CASE WHEN t.grant_role = 'owner'   THEN auth.uid() ELSE owner_profile_id END
        WHERE id = t.clan_id;
    END IF;

    SELECT id INTO pid FROM public.players WHERE profile_id = auth.uid() LIMIT 1;
    IF pid IS NULL THEN
      INSERT INTO public.players (profile_id, gamertag, main_game)
        SELECT auth.uid(), COALESCE(p.gamertag, p.display_name, 'Player'), 'eFootball Mobile'
        FROM public.profiles p WHERE p.id = auth.uid()
        RETURNING id INTO pid;
    END IF;

    IF t.grant_role = 'coach' THEN
      INSERT INTO public.clan_coaches (clan_id, profile_id, name, head_coach)
        SELECT t.clan_id, auth.uid(), COALESCE(pr.display_name, 'Coach'), false
        FROM public.profiles pr WHERE pr.id = auth.uid();
    ELSIF t.grant_role IN ('player','captain','owner') THEN
      INSERT INTO public.clan_members (clan_id, player_id, member_role, title)
        VALUES (t.clan_id, pid,
          CASE WHEN t.grant_role IN ('captain','owner') THEN 'captain'::clan_member_role ELSE 'player'::clan_member_role END,
          NULLIF(t.grant_metadata->>'title',''));
    END IF;
  END IF;

  UPDATE public.clan_create_tokens SET uses = uses + 1, used_at = now(), used_by = auth.uid() WHERE id = t.id;
  RETURN jsonb_build_object('ok', true, 'purpose', t.token_purpose, 'clan_id', t.clan_id, 'role', t.grant_role);
END;
$$;

-- ============ NEWS EDITORS ============
CREATE TABLE IF NOT EXISTS public.news_editors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  community_id uuid,
  can_publish boolean NOT NULL DEFAULT true,
  granted_by uuid,
  granted_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  UNIQUE(user_id, community_id)
);
ALTER TABLE public.news_editors ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ne public read" ON public.news_editors;
DROP POLICY IF EXISTS "ne admin write" ON public.news_editors;
CREATE POLICY "ne public read" ON public.news_editors FOR SELECT USING (true);
CREATE POLICY "ne admin write" ON public.news_editors FOR ALL
  USING (is_admin(auth.uid()) OR (community_id IS NOT NULL AND is_community_admin(auth.uid(), community_id)))
  WITH CHECK (is_admin(auth.uid()) OR (community_id IS NOT NULL AND is_community_admin(auth.uid(), community_id)));

CREATE OR REPLACE FUNCTION public.is_news_editor(_user_id uuid, _community_id uuid DEFAULT NULL)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT is_admin(_user_id) OR EXISTS(
    SELECT 1 FROM public.news_editors
    WHERE user_id = _user_id
      AND (community_id IS NULL OR community_id = _community_id)
      AND (expires_at IS NULL OR expires_at > now())
  );
$$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'news_articles') THEN
    EXECUTE 'ALTER TABLE public.news_articles
      ADD COLUMN IF NOT EXISTS community_id uuid,
      ADD COLUMN IF NOT EXISTS author_id uuid,
      ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT ''draft'',
      ADD COLUMN IF NOT EXISTS published_at timestamptz';
  END IF;
END $$;

-- ============ TWITCH CHANNELS ============
CREATE TABLE IF NOT EXISTS public.twitch_channels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  twitch_login text NOT NULL UNIQUE,
  display_name text,
  player_id uuid,
  clan_id uuid,
  community_id uuid,
  pinned boolean NOT NULL DEFAULT false,
  show_on_home boolean NOT NULL DEFAULT true,
  added_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.twitch_channels ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tw public read" ON public.twitch_channels;
DROP POLICY IF EXISTS "tw admin write" ON public.twitch_channels;
DROP POLICY IF EXISTS "tw self write" ON public.twitch_channels;
CREATE POLICY "tw public read" ON public.twitch_channels FOR SELECT USING (true);
CREATE POLICY "tw admin write" ON public.twitch_channels FOR ALL USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "tw self write" ON public.twitch_channels FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = added_by AND (
      (player_id IS NOT NULL AND EXISTS(SELECT 1 FROM public.players p WHERE p.id = player_id AND p.profile_id = auth.uid()))
      OR (clan_id IS NOT NULL AND EXISTS(SELECT 1 FROM public.clans c WHERE c.id = clan_id AND (c.captain_profile_id = auth.uid() OR c.owner_profile_id = auth.uid())))
    )
  );

-- ============ AUTO-SPAWN CLAN ROOM FROM BRACKET MATCH ============
CREATE OR REPLACE FUNCTION public.auto_spawn_clan_room_from_bracket()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  t public.tournaments%ROWTYPE;
  reg_a public.tournament_registrations%ROWTYPE;
  reg_b public.tournament_registrations%ROWTYPE;
  new_room_id uuid;
BEGIN
  IF NEW.participant_a_id IS NULL OR NEW.participant_b_id IS NULL THEN RETURN NEW; END IF;
  IF NEW.clan_match_room_id IS NOT NULL THEN RETURN NEW; END IF;
  SELECT * INTO t FROM public.tournaments WHERE id = NEW.tournament_id;
  IF t.participant_type <> 'clan' THEN RETURN NEW; END IF;
  SELECT * INTO reg_a FROM public.tournament_registrations WHERE id = NEW.participant_a_id;
  SELECT * INTO reg_b FROM public.tournament_registrations WHERE id = NEW.participant_b_id;
  IF reg_a.clan_id IS NULL OR reg_b.clan_id IS NULL THEN RETURN NEW; END IF;

  INSERT INTO public.clan_match_rooms (clan_a_id, clan_b_id, tournament_id, match_type, scheduled_at, lineup_deadline, status, player_count)
    VALUES (reg_a.clan_id, reg_b.clan_id, t.id, 'tournament', NEW.scheduled_at,
            COALESCE(NEW.scheduled_at, now() + interval '7 days') - interval '4 hours',
            'scheduled', COALESCE(t.team_size, 11))
    RETURNING id INTO new_room_id;
  NEW.clan_match_room_id := new_room_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auto_spawn_clan_room ON public.bracket_matches;
CREATE TRIGGER trg_auto_spawn_clan_room
  BEFORE INSERT OR UPDATE OF participant_a_id, participant_b_id ON public.bracket_matches
  FOR EACH ROW EXECUTE FUNCTION public.auto_spawn_clan_room_from_bracket();

-- ============ TOURNAMENT INSERT POLICY (allow grant holders) ============
DROP POLICY IF EXISTS "tour insert authed" ON public.tournaments;
DROP POLICY IF EXISTS "tour insert grant" ON public.tournaments;
CREATE POLICY "tour insert grant" ON public.tournaments FOR INSERT TO authenticated
  WITH CHECK (public.can_create_tournaments(auth.uid()));

-- === 20260502140554_8693fd24-4fa7-4462-a6db-a19c7174f6d5.sql ===

-- ============ SITE SETTINGS (superadmin customization) ============
CREATE TABLE IF NOT EXISTS public.site_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "site_settings public read" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "site_settings super write" ON public.site_settings FOR ALL
  USING (has_role(auth.uid(),'super_admin'::app_role))
  WITH CHECK (has_role(auth.uid(),'super_admin'::app_role));

INSERT INTO public.site_settings (key,value) VALUES
  ('hero', jsonb_build_object('title','The eSports hub for eFootball players','subtitle','From kickoff to crowning the champion â€” clans, tournaments, leagues, all in one home.','cta_primary','Browse Clans','cta_primary_href','/clan-hub','cta_secondary','View Tournaments','cta_secondary_href','/tournaments')),
  ('theme', jsonb_build_object('primary','271 91% 65%','accent','187 95% 55%','gold','45 95% 55%','background','240 10% 4%','radius','0.75rem')),
  ('features', jsonb_build_object('show_twitch',true,'show_news',true,'show_sponsors',true,'show_eleague_pinned',true)),
  ('branding', jsonb_build_object('site_name','KAF Connect','tagline','eFootball eSports Hub','logo_url',null))
ON CONFLICT (key) DO NOTHING;

-- ============ ESPORTS TEAMS (KAF E-League only) ============
CREATE TABLE IF NOT EXISTS public.esports_teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  tag text NOT NULL,
  logo_url text,
  banner_url text,
  primary_color text DEFAULT '#7c3aed',
  accent_color text DEFAULT '#22d3ee',
  description text,
  region text,
  country text,
  source_clan_ids uuid[] DEFAULT '{}',
  status text NOT NULL DEFAULT 'active',
  league text NOT NULL DEFAULT 'KAF E-League',
  elo integer NOT NULL DEFAULT 1000,
  wins integer NOT NULL DEFAULT 0,
  losses integer NOT NULL DEFAULT 0,
  draws integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid
);
ALTER TABLE public.esports_teams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "eteams public read" ON public.esports_teams FOR SELECT USING (true);
CREATE POLICY "eteams admin write" ON public.esports_teams FOR ALL
  USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

CREATE TABLE IF NOT EXISTS public.esports_team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.esports_teams(id) ON DELETE CASCADE,
  player_id uuid,
  profile_id uuid,
  display_name text,
  role text NOT NULL DEFAULT 'player',
  title text,
  squad_number integer,
  source_clan_id uuid,
  joined_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.esports_team_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "etm public read" ON public.esports_team_members FOR SELECT USING (true);
CREATE POLICY "etm admin write" ON public.esports_team_members FOR ALL
  USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

-- ============ COMMUNITY MEMBERS / ROLES / TITLES ============
CREATE TABLE IF NOT EXISTS public.community_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id uuid NOT NULL,
  user_id uuid,
  player_id uuid,
  display_name text,
  role text NOT NULL DEFAULT 'member',
  title text,
  joined_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cm public read" ON public.community_members FOR SELECT USING (true);
CREATE POLICY "cm admin write" ON public.community_members FOR ALL
  USING (is_admin(auth.uid()) OR is_community_admin(auth.uid(), community_id))
  WITH CHECK (is_admin(auth.uid()) OR is_community_admin(auth.uid(), community_id));

-- Community super admin role check (highest scope per community)
CREATE OR REPLACE FUNCTION public.is_community_super_admin(_user_id uuid, _community_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT has_role(_user_id,'super_admin'::app_role) OR EXISTS(
    SELECT 1 FROM public.community_admins
    WHERE user_id=_user_id AND community_id=_community_id
      AND 'super_admin' = ANY(permissions)
      AND (expires_at IS NULL OR expires_at > now())
  );
$$;

-- Community settings
CREATE TABLE IF NOT EXISTS public.community_settings (
  community_id uuid PRIMARY KEY,
  settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.community_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "csset public read" ON public.community_settings FOR SELECT USING (true);
CREATE POLICY "csset admin write" ON public.community_settings FOR ALL
  USING (is_admin(auth.uid()) OR is_community_admin(auth.uid(), community_id))
  WITH CHECK (is_admin(auth.uid()) OR is_community_admin(auth.uid(), community_id));

-- Pre-made clans authored by community admins (community owns the clan record via clans.community_id which already exists; allow community admins to create/update clans they own)
DROP POLICY IF EXISTS "clans community admin write" ON public.clans;
CREATE POLICY "clans community admin write" ON public.clans FOR UPDATE
  USING (community_id IS NOT NULL AND is_community_admin(auth.uid(), community_id));

DROP POLICY IF EXISTS "clans community admin insert" ON public.clans;
CREATE POLICY "clans community admin insert" ON public.clans FOR INSERT
  WITH CHECK (community_id IS NULL OR is_community_admin(auth.uid(), community_id) OR auth.uid() IS NOT NULL);

-- Clan badge config (image + numeric overlays editable by admin)
CREATE TABLE IF NOT EXISTS public.clan_badge_config (
  clan_id uuid PRIMARY KEY,
  badge_image_url text,
  show_tier boolean NOT NULL DEFAULT true,
  show_level boolean NOT NULL DEFAULT true,
  show_elo boolean NOT NULL DEFAULT false,
  overlay_color text DEFAULT '#ffffff',
  custom_text text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.clan_badge_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "badgecfg public read" ON public.clan_badge_config FOR SELECT USING (true);
CREATE POLICY "badgecfg captain/admin write" ON public.clan_badge_config FOR ALL
  USING (is_admin(auth.uid()) OR EXISTS(SELECT 1 FROM clans c WHERE c.id=clan_id AND (c.captain_profile_id=auth.uid() OR c.owner_profile_id=auth.uid())))
  WITH CHECK (is_admin(auth.uid()) OR EXISTS(SELECT 1 FROM clans c WHERE c.id=clan_id AND (c.captain_profile_id=auth.uid() OR c.owner_profile_id=auth.uid())));


-- === 20260502141721_e070d598-e5d0-4e5c-96f3-4745b4adfa48.sql ===
-- Add per-community theme + space settings
ALTER TABLE public.communities
  ADD COLUMN IF NOT EXISTS theme jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS tagline text,
  ADD COLUMN IF NOT EXISTS welcome_message text,
  ADD COLUMN IF NOT EXISTS owner_user_id uuid;

-- Player clan history
CREATE TABLE IF NOT EXISTS public.player_clan_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid NOT NULL,
  clan_id uuid,
  clan_name_snapshot text,
  community_id uuid,
  joined_at timestamptz NOT NULL DEFAULT now(),
  left_at timestamptz,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.player_clan_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "pch public read" ON public.player_clan_history;
CREATE POLICY "pch public read" ON public.player_clan_history FOR SELECT USING (true);
DROP POLICY IF EXISTS "pch admin write" ON public.player_clan_history;
CREATE POLICY "pch admin write" ON public.player_clan_history FOR ALL USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));
DROP POLICY IF EXISTS "pch self/captain insert" ON public.player_clan_history;
CREATE POLICY "pch self/captain insert" ON public.player_clan_history FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL AND (
    EXISTS(SELECT 1 FROM players p WHERE p.id = player_id AND p.profile_id = auth.uid())
    OR EXISTS(SELECT 1 FROM clans c WHERE c.id = clan_id AND (c.captain_profile_id = auth.uid() OR c.owner_profile_id = auth.uid()))
    OR is_admin(auth.uid())
  )
);
CREATE INDEX IF NOT EXISTS idx_pch_player ON public.player_clan_history(player_id);
CREATE INDEX IF NOT EXISTS idx_pch_clan ON public.player_clan_history(clan_id);

-- Trigger: when a player's current_clan_id changes, log it
CREATE OR REPLACE FUNCTION public.log_player_clan_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  cname text; cmid uuid;
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.current_clan_id IS DISTINCT FROM OLD.current_clan_id THEN
    -- Close any open history for the player
    UPDATE public.player_clan_history SET left_at = now()
      WHERE player_id = NEW.id AND left_at IS NULL;
    IF NEW.current_clan_id IS NOT NULL THEN
      SELECT name, community_id INTO cname, cmid FROM public.clans WHERE id = NEW.current_clan_id;
      INSERT INTO public.player_clan_history (player_id, clan_id, clan_name_snapshot, community_id)
        VALUES (NEW.id, NEW.current_clan_id, cname, cmid);
    END IF;
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS trg_log_player_clan_change ON public.players;
CREATE TRIGGER trg_log_player_clan_change AFTER UPDATE ON public.players
  FOR EACH ROW EXECUTE FUNCTION public.log_player_clan_change();

-- site_settings rows for maintenance + clan-only lock (uses existing site_settings table via key/value)
INSERT INTO public.site_settings (key, value)
  VALUES ('site_mode', '{"maintenance": false, "clans_only": false, "maintenance_message": "We are doing maintenance. Back soon."}'::jsonb)
  ON CONFLICT (key) DO NOTHING;


-- === 20260502143031_e24b9b5a-5c69-430a-88b3-d443e836b927.sql ===
-- Extend existing notifications table
ALTER TABLE public.notifications
  ADD COLUMN IF NOT EXISTS data jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS read_at timestamptz;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "notif self read" ON public.notifications;
CREATE POLICY "notif self read" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "notif self update" ON public.notifications;
CREATE POLICY "notif self update" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "notif self delete" ON public.notifications;
CREATE POLICY "notif self delete" ON public.notifications FOR DELETE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "notif system insert" ON public.notifications;
CREATE POLICY "notif system insert" ON public.notifications FOR INSERT WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_notif_user_created ON public.notifications(user_id, created_at DESC);

DO $$ BEGIN
  PERFORM 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='notifications';
  IF NOT FOUND THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications';
  END IF;
END $$;

-- Helper
CREATE OR REPLACE FUNCTION public.notify_user(_user_id uuid, _type text, _title text, _body text, _link text DEFAULT NULL, _data jsonb DEFAULT '{}'::jsonb)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF _user_id IS NULL THEN RETURN; END IF;
  INSERT INTO public.notifications (user_id, type, title, body, link, data)
    VALUES (_user_id, _type, _title, _body, _link, COALESCE(_data, '{}'::jsonb));
END $$;

-- Triggers
CREATE OR REPLACE FUNCTION public.notify_clan_invite()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE uid uuid; cname text;
BEGIN
  SELECT p.profile_id INTO uid FROM players p WHERE p.id = NEW.invited_player_id;
  SELECT name INTO cname FROM clans WHERE id = NEW.clan_id;
  PERFORM public.notify_user(uid, 'clan_invite', 'Clan invitation', 'You have been invited to join ' || COALESCE(cname,'a clan'), '/clans/' || NEW.clan_id, jsonb_build_object('invite_id', NEW.id));
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS trg_notify_clan_invite ON public.clan_invites;
CREATE TRIGGER trg_notify_clan_invite AFTER INSERT ON public.clan_invites FOR EACH ROW EXECUTE FUNCTION public.notify_clan_invite();

CREATE OR REPLACE FUNCTION public.notify_clan_join_request()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE uid uuid; cname text; pname text;
BEGIN
  SELECT captain_profile_id, name INTO uid, cname FROM clans WHERE id = NEW.clan_id;
  SELECT gamertag INTO pname FROM players WHERE id = NEW.player_id;
  PERFORM public.notify_user(uid, 'clan_join_request', 'New join request', COALESCE(pname,'A player') || ' wants to join ' || COALESCE(cname,'your clan'), '/clans/' || NEW.clan_id, jsonb_build_object('request_id', NEW.id));
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS trg_notify_join_request ON public.clan_join_requests;
CREATE TRIGGER trg_notify_join_request AFTER INSERT ON public.clan_join_requests FOR EACH ROW EXECUTE FUNCTION public.notify_clan_join_request();

CREATE OR REPLACE FUNCTION public.notify_registration_decision()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE tname text;
BEGIN
  IF TG_OP='UPDATE' AND NEW.status IS DISTINCT FROM OLD.status AND NEW.status IN ('approved','rejected') THEN
    SELECT title INTO tname FROM tournaments WHERE id = NEW.tournament_id;
    PERFORM public.notify_user(NEW.created_by, 'registration_' || NEW.status,
      CASE WHEN NEW.status='approved' THEN 'Registration approved' ELSE 'Registration rejected' END,
      'Your registration for ' || COALESCE(tname,'the tournament') || ' was ' || NEW.status,
      '/tournaments/' || NEW.tournament_id);
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS trg_notify_registration ON public.tournament_registrations;
CREATE TRIGGER trg_notify_registration AFTER UPDATE ON public.tournament_registrations FOR EACH ROW EXECUTE FUNCTION public.notify_registration_decision();

CREATE OR REPLACE FUNCTION public.notify_match_result()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE room clan_match_rooms%ROWTYPE; uid_a uuid; uid_b uuid;
BEGIN
  IF NEW.status = 'approved' AND (TG_OP='INSERT' OR OLD.status <> 'approved') THEN
    SELECT * INTO room FROM clan_match_rooms WHERE id = NEW.room_id;
    IF FOUND THEN
      SELECT captain_profile_id INTO uid_a FROM clans WHERE id = room.clan_a_id;
      SELECT captain_profile_id INTO uid_b FROM clans WHERE id = room.clan_b_id;
      PERFORM public.notify_user(uid_a, 'match_result', 'Match result confirmed', 'Final score ' || NEW.score_a || ' - ' || NEW.score_b, '/match/' || room.id);
      PERFORM public.notify_user(uid_b, 'match_result', 'Match result confirmed', 'Final score ' || NEW.score_a || ' - ' || NEW.score_b, '/match/' || room.id);
    END IF;
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS trg_notify_match_result ON public.clan_match_results;
CREATE TRIGGER trg_notify_match_result AFTER INSERT OR UPDATE ON public.clan_match_results FOR EACH ROW EXECUTE FUNCTION public.notify_match_result();

CREATE OR REPLACE FUNCTION public.notify_dispute_resolved()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status IN ('resolved','rejected') AND OLD.status = 'open' THEN
    PERFORM public.notify_user(NEW.opened_by, 'dispute_resolved', 'Dispute resolved', COALESCE(NEW.resolution,'A dispute you opened was resolved'), '/match/' || NEW.room_id);
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS trg_notify_dispute ON public.clan_match_disputes;
CREATE TRIGGER trg_notify_dispute AFTER UPDATE ON public.clan_match_disputes FOR EACH ROW EXECUTE FUNCTION public.notify_dispute_resolved();

-- ============ PLAYER CLAIM TOKENS ============
CREATE TABLE IF NOT EXISTS public.player_claim_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid NOT NULL,
  token text NOT NULL UNIQUE,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  used_at timestamptz,
  used_by uuid,
  expires_at timestamptz
);
ALTER TABLE public.player_claim_tokens ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "pct admin all" ON public.player_claim_tokens;
CREATE POLICY "pct admin all" ON public.player_claim_tokens FOR ALL USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

CREATE OR REPLACE FUNCTION public.claim_player(_token text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE t player_claim_tokens%ROWTYPE; existing uuid;
BEGIN
  IF auth.uid() IS NULL THEN RETURN jsonb_build_object('ok',false,'error','Sign in required'); END IF;
  SELECT * INTO t FROM player_claim_tokens WHERE token = _token FOR UPDATE;
  IF NOT FOUND THEN RETURN jsonb_build_object('ok',false,'error','Invalid token'); END IF;
  IF t.used_at IS NOT NULL THEN RETURN jsonb_build_object('ok',false,'error','Token already used'); END IF;
  IF t.expires_at IS NOT NULL AND t.expires_at < now() THEN RETURN jsonb_build_object('ok',false,'error','Token expired'); END IF;
  SELECT profile_id INTO existing FROM players WHERE id = t.player_id;
  IF existing IS NOT NULL AND existing <> auth.uid() THEN RETURN jsonb_build_object('ok',false,'error','Player already claimed'); END IF;
  UPDATE players SET profile_id = auth.uid() WHERE id = t.player_id;
  UPDATE player_claim_tokens SET used_at = now(), used_by = auth.uid() WHERE id = t.id;
  RETURN jsonb_build_object('ok',true,'player_id',t.player_id);
END $$;

-- ============ BRACKET AUTO-PROGRESS ============
CREATE OR REPLACE FUNCTION public.advance_bracket_after_report()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE m bracket_matches%ROWTYPE; winner uuid; loser uuid;
BEGIN
  IF NEW.status <> 'approved' OR (TG_OP='UPDATE' AND OLD.status='approved') THEN RETURN NEW; END IF;
  SELECT * INTO m FROM bracket_matches WHERE id = NEW.match_id;
  IF NOT FOUND THEN RETURN NEW; END IF;
  IF NEW.score_a > NEW.score_b THEN winner := m.participant_a_id; loser := m.participant_b_id;
  ELSIF NEW.score_b > NEW.score_a THEN winner := m.participant_b_id; loser := m.participant_a_id;
  END IF;
  UPDATE bracket_matches SET status='completed', score_a=NEW.score_a, score_b=NEW.score_b, winner_id=winner WHERE id = m.id;
  IF winner IS NOT NULL AND m.next_match_id IS NOT NULL THEN
    UPDATE bracket_matches SET
      participant_a_id = COALESCE(participant_a_id, winner),
      participant_b_id = CASE WHEN participant_a_id IS NOT NULL AND participant_a_id <> winner THEN COALESCE(participant_b_id, winner) ELSE participant_b_id END
      WHERE id = m.next_match_id;
  END IF;
  IF loser IS NOT NULL AND m.next_loser_match_id IS NOT NULL THEN
    UPDATE bracket_matches SET
      participant_a_id = COALESCE(participant_a_id, loser),
      participant_b_id = CASE WHEN participant_a_id IS NOT NULL AND participant_a_id <> loser THEN COALESCE(participant_b_id, loser) ELSE participant_b_id END
      WHERE id = m.next_loser_match_id;
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS trg_advance_bracket ON public.bracket_match_reports;
CREATE TRIGGER trg_advance_bracket AFTER INSERT OR UPDATE ON public.bracket_match_reports FOR EACH ROW EXECUTE FUNCTION public.advance_bracket_after_report();

-- ============ ANNOUNCEMENT ============
INSERT INTO public.site_settings (key, value)
  VALUES ('announcement', '{"visible": false, "message": "", "level": "info", "link": "", "link_label": ""}'::jsonb)
  ON CONFLICT (key) DO NOTHING;

-- ============ REPORTS ============
CREATE TABLE IF NOT EXISTS public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL,
  target_type text NOT NULL,
  target_id uuid NOT NULL,
  reason text NOT NULL,
  details text,
  community_id uuid,
  status text NOT NULL DEFAULT 'open',
  resolved_by uuid,
  resolved_at timestamptz,
  resolution text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "rep authed insert" ON public.reports;
CREATE POLICY "rep authed insert" ON public.reports FOR INSERT TO authenticated WITH CHECK (auth.uid() = reporter_id);
DROP POLICY IF EXISTS "rep self read" ON public.reports;
CREATE POLICY "rep self read" ON public.reports FOR SELECT USING (auth.uid() = reporter_id OR is_admin(auth.uid()) OR (community_id IS NOT NULL AND is_community_admin(auth.uid(), community_id)));
DROP POLICY IF EXISTS "rep admin update" ON public.reports;
CREATE POLICY "rep admin update" ON public.reports FOR UPDATE USING (is_admin(auth.uid()) OR (community_id IS NOT NULL AND is_community_admin(auth.uid(), community_id)));


-- === 20260502143522_email_infra.sql ===
-- Email infrastructure
-- Creates the queue system, send log, send state, suppression, and unsubscribe
-- tables used by both auth and transactional emails.

-- Extensions required for queue processing
CREATE EXTENSION IF NOT EXISTS pg_net SCHEMA extensions;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    CREATE EXTENSION pg_cron;
  END IF;
END $$;
CREATE EXTENSION IF NOT EXISTS supabase_vault;
CREATE EXTENSION IF NOT EXISTS pgmq;

-- Create email queues (auth = high priority, transactional = normal)
-- Wrapped in DO blocks to handle "queue already exists" errors idempotently.
DO $$ BEGIN PERFORM pgmq.create('auth_emails'); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN PERFORM pgmq.create('transactional_emails'); EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- Dead-letter queues for messages that exceed max retries
DO $$ BEGIN PERFORM pgmq.create('auth_emails_dlq'); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN PERFORM pgmq.create('transactional_emails_dlq'); EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- Email send log table (audit trail for all send attempts)
-- UPDATE is allowed for the service role so the suppression edge function
-- can update a log record's status when a bounce/complaint/unsubscribe occurs.
CREATE TABLE IF NOT EXISTS public.email_send_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id TEXT,
  template_name TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'sent', 'suppressed', 'failed', 'bounced', 'complained', 'dlq')),
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.email_send_log ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Service role can read send log"
    ON public.email_send_log FOR SELECT
    USING (auth.role() = 'service_role');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Service role can insert send log"
    ON public.email_send_log FOR INSERT
    WITH CHECK (auth.role() = 'service_role');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Service role can update send log"
    ON public.email_send_log FOR UPDATE
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_email_send_log_created ON public.email_send_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_send_log_recipient ON public.email_send_log(recipient_email);

-- Backfill: add message_id column to existing tables that predate this migration
DO $$ BEGIN
  ALTER TABLE public.email_send_log ADD COLUMN message_id TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_email_send_log_message ON public.email_send_log(message_id);

-- Prevent duplicate sends: only one 'sent' row per message_id.
-- If VT expires and another worker picks up the same message, the pre-send
-- check catches it. This index is a DB-level safety net for race conditions.
CREATE UNIQUE INDEX IF NOT EXISTS idx_email_send_log_message_sent_unique
  ON public.email_send_log(message_id) WHERE status = 'sent';

-- Backfill: update status CHECK constraint for existing tables that predate new statuses
DO $$ BEGIN
  ALTER TABLE public.email_send_log DROP CONSTRAINT IF EXISTS email_send_log_status_check;
  ALTER TABLE public.email_send_log ADD CONSTRAINT email_send_log_status_check
    CHECK (status IN ('pending', 'sent', 'suppressed', 'failed', 'bounced', 'complained', 'dlq'));
END $$;

-- Rate-limit state and queue config (single row, tracks Retry-After cooldown + throughput settings)
CREATE TABLE IF NOT EXISTS public.email_send_state (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  retry_after_until TIMESTAMPTZ,
  batch_size INTEGER NOT NULL DEFAULT 10,
  send_delay_ms INTEGER NOT NULL DEFAULT 200,
  auth_email_ttl_minutes INTEGER NOT NULL DEFAULT 15,
  transactional_email_ttl_minutes INTEGER NOT NULL DEFAULT 60,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO public.email_send_state (id) VALUES (1) ON CONFLICT DO NOTHING;

-- Backfill: add config columns to existing tables that predate this migration
DO $$ BEGIN
  ALTER TABLE public.email_send_state ADD COLUMN batch_size INTEGER NOT NULL DEFAULT 10;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE public.email_send_state ADD COLUMN send_delay_ms INTEGER NOT NULL DEFAULT 200;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE public.email_send_state ADD COLUMN auth_email_ttl_minutes INTEGER NOT NULL DEFAULT 15;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE public.email_send_state ADD COLUMN transactional_email_ttl_minutes INTEGER NOT NULL DEFAULT 60;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

ALTER TABLE public.email_send_state ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Service role can manage send state"
    ON public.email_send_state FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- RPC wrappers so Edge Functions can interact with pgmq via supabase.rpc()
-- (PostgREST only exposes functions in the public schema; pgmq functions are in the pgmq schema)
-- All wrappers auto-create the queue on undefined_table (42P01) so emails
-- are never lost if the queue was dropped (extension upgrade, restore, etc.).
CREATE OR REPLACE FUNCTION public.enqueue_email(queue_name TEXT, payload JSONB)
RETURNS BIGINT
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  RETURN pgmq.send(queue_name, payload);
EXCEPTION WHEN undefined_table THEN
  PERFORM pgmq.create(queue_name);
  RETURN pgmq.send(queue_name, payload);
END;
$$;

CREATE OR REPLACE FUNCTION public.read_email_batch(queue_name TEXT, batch_size INT, vt INT)
RETURNS TABLE(msg_id BIGINT, read_ct INT, message JSONB)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY SELECT r.msg_id, r.read_ct, r.message FROM pgmq.read(queue_name, vt, batch_size) r;
EXCEPTION WHEN undefined_table THEN
  PERFORM pgmq.create(queue_name);
  RETURN;
END;
$$;

CREATE OR REPLACE FUNCTION public.delete_email(queue_name TEXT, message_id BIGINT)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  RETURN pgmq.delete(queue_name, message_id);
EXCEPTION WHEN undefined_table THEN
  RETURN FALSE;
END;
$$;

CREATE OR REPLACE FUNCTION public.move_to_dlq(
  source_queue TEXT, dlq_name TEXT, message_id BIGINT, payload JSONB
)
RETURNS BIGINT
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE new_id BIGINT;
BEGIN
  SELECT pgmq.send(dlq_name, payload) INTO new_id;
  PERFORM pgmq.delete(source_queue, message_id);
  RETURN new_id;
EXCEPTION WHEN undefined_table THEN
  BEGIN
    PERFORM pgmq.create(dlq_name);
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
  SELECT pgmq.send(dlq_name, payload) INTO new_id;
  BEGIN
    PERFORM pgmq.delete(source_queue, message_id);
  EXCEPTION WHEN undefined_table THEN
    NULL;
  END;
  RETURN new_id;
END;
$$;

-- Restrict queue RPC wrappers to service_role only (SECURITY DEFINER runs as owner,
-- so without this any authenticated user could manipulate the email queues)
REVOKE EXECUTE ON FUNCTION public.enqueue_email(TEXT, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.enqueue_email(TEXT, JSONB) TO service_role;

REVOKE EXECUTE ON FUNCTION public.read_email_batch(TEXT, INT, INT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.read_email_batch(TEXT, INT, INT) TO service_role;

REVOKE EXECUTE ON FUNCTION public.delete_email(TEXT, BIGINT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_email(TEXT, BIGINT) TO service_role;

REVOKE EXECUTE ON FUNCTION public.move_to_dlq(TEXT, TEXT, BIGINT, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.move_to_dlq(TEXT, TEXT, BIGINT, JSONB) TO service_role;

-- Suppressed emails table (tracks unsubscribes, bounces, complaints)
-- Append-only: no DELETE or UPDATE policies to prevent bypassing suppression.
CREATE TABLE IF NOT EXISTS public.suppressed_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  reason TEXT NOT NULL CHECK (reason IN ('unsubscribe', 'bounce', 'complaint')),
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(email)
);

ALTER TABLE public.suppressed_emails ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Service role can read suppressed emails"
    ON public.suppressed_emails FOR SELECT
    USING (auth.role() = 'service_role');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Service role can insert suppressed emails"
    ON public.suppressed_emails FOR INSERT
    WITH CHECK (auth.role() = 'service_role');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_suppressed_emails_email ON public.suppressed_emails(email);

-- Email unsubscribe tokens table (one token per email address for unsubscribe links)
-- No DELETE policy to prevent removing tokens. UPDATE allowed only to mark tokens as used.
CREATE TABLE IF NOT EXISTS public.email_unsubscribe_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  used_at TIMESTAMPTZ
);

ALTER TABLE public.email_unsubscribe_tokens ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Service role can read tokens"
    ON public.email_unsubscribe_tokens FOR SELECT
    USING (auth.role() = 'service_role');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Service role can insert tokens"
    ON public.email_unsubscribe_tokens FOR INSERT
    WITH CHECK (auth.role() = 'service_role');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Service role can mark tokens as used"
    ON public.email_unsubscribe_tokens FOR UPDATE
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_unsubscribe_tokens_token ON public.email_unsubscribe_tokens(token);

-- ============================================================
-- POST-MIGRATION STEPS (applied dynamically by setup_email_infra)
-- These steps contain project-specific secrets and URLs and
-- cannot be expressed as static SQL. They are applied via the
-- Supabase Management API (ExecuteSQL) each time the tool runs.
-- ============================================================
--
-- 1. VAULT SECRET
--    Stores (or updates) the Supabase service_role key in
--    vault as 'email_queue_service_role_key'.
--    Uses vault.create_secret / vault.update_secret (upsert).
--    To revert: DELETE FROM vault.secrets WHERE name = 'email_queue_service_role_key';
--
-- 2. CRON JOB (pg_cron)
--    Creates job 'process-email-queue' with a 5-second interval.
--    The job checks:
--      a) rate-limit cooldown (email_send_state.retry_after_until)
--      b) whether auth_emails or transactional_emails queues have messages
--    If conditions are met, it calls the process-email-queue Edge Function
--    via net.http_post using the vault-stored service_role key.
--    To revert: SELECT cron.unschedule('process-email-queue');


-- === 20260502145056_ed2b15a6-d2a4-44bc-aaff-3cd9954b6d82.sql ===
-- ============ 1. LOCK CLAN CREATION ============
-- Drop the loose "any authed can insert" policy
DROP POLICY IF EXISTS "clans insert authed" ON public.clans;
DROP POLICY IF EXISTS "clans community admin insert" ON public.clans;

-- New: clan insert requires admin OR community admin OR a valid unconsumed token
CREATE OR REPLACE FUNCTION public.user_has_valid_clan_token(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.clan_create_tokens
    WHERE used_by = _user_id
      AND used_at > now() - interval '10 minutes'
      AND token_purpose = 'create_clan'
  );
$$;

CREATE POLICY "clans gated insert" ON public.clans
FOR INSERT TO authenticated
WITH CHECK (
  public.is_admin(auth.uid())
  OR (community_id IS NOT NULL AND public.is_community_admin(auth.uid(), community_id))
  OR public.user_has_valid_clan_token(auth.uid())
);

-- ============ 2. LOCK TOURNAMENT CREATION ============
-- Already has `can_create_tournaments` gate â€” keep it but ensure no other open inserts exist
-- (tour insert grant already enforces can_create_tournaments â€” good)

-- ============ 3. COMMUNITY REGION CODE ============
ALTER TABLE public.communities
  ADD COLUMN IF NOT EXISTS region_code text;
CREATE INDEX IF NOT EXISTS idx_communities_region_code ON public.communities(region_code);

-- ============ 4. CLAN TOKEN SCOPING ============
ALTER TABLE public.clan_create_tokens
  ADD COLUMN IF NOT EXISTS community_id uuid REFERENCES public.communities(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS region_code text;

-- Update consume_clan_token to apply community/region from token to created clan
CREATE OR REPLACE FUNCTION public.validate_clan_token(_token text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE t public.clan_create_tokens%ROWTYPE; cname text;
BEGIN
  SELECT * INTO t FROM public.clan_create_tokens WHERE token = _token;
  IF NOT FOUND THEN RETURN jsonb_build_object('ok', false, 'error', 'Invalid token'); END IF;
  IF t.expires_at IS NOT NULL AND t.expires_at < now() THEN RETURN jsonb_build_object('ok', false, 'error', 'Expired'); END IF;
  IF t.uses >= t.max_uses THEN RETURN jsonb_build_object('ok', false, 'error', 'Already used'); END IF;
  SELECT name INTO cname FROM public.communities WHERE id = t.community_id;
  RETURN jsonb_build_object(
    'ok', true, 'label', t.label, 'uses', t.uses, 'max_uses', t.max_uses,
    'expires_at', t.expires_at, 'purpose', t.token_purpose,
    'community_id', t.community_id, 'community_name', cname, 'region_code', t.region_code
  );
END $$;

-- ============ 5. STAFF MATCH CONTROL RPCs ============
-- Helper: check if user is staff for a given clan match room
CREATE OR REPLACE FUNCTION public.is_match_staff(_user_id uuid, _room_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.is_admin(_user_id)
    OR EXISTS(
      SELECT 1 FROM public.clan_match_rooms r
      LEFT JOIN public.tournaments t ON t.id = r.tournament_id
      WHERE r.id = _room_id
        AND (
          r.referee_user_id = _user_id
          OR (t.community_id IS NOT NULL AND public.is_community_admin(_user_id, t.community_id))
        )
    );
$$;

-- Staff force-submit a result (creates an auto-approved result row)
CREATE OR REPLACE FUNCTION public.staff_force_submit_result(
  _room_id uuid, _score_a integer, _score_b integer, _reason text DEFAULT NULL, _evidence_url text DEFAULT NULL
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r public.clan_match_rooms%ROWTYPE; new_id uuid;
BEGIN
  IF NOT public.is_match_staff(auth.uid(), _room_id) THEN RETURN jsonb_build_object('ok',false,'error','Not authorized'); END IF;
  SELECT * INTO r FROM public.clan_match_rooms WHERE id = _room_id;
  IF NOT FOUND THEN RETURN jsonb_build_object('ok',false,'error','Room not found'); END IF;
  INSERT INTO public.clan_match_results (room_id, submitted_by, submitting_clan_id, score_a, score_b, status, notes, evidence_url)
    VALUES (_room_id, auth.uid(), r.clan_a_id, _score_a, _score_b, 'approved', COALESCE(_reason, 'Staff force-submit'), _evidence_url)
    RETURNING id INTO new_id;
  INSERT INTO public.clan_audit_logs(clan_id, actor_user_id, action, reason, new_value)
    VALUES (r.clan_a_id, auth.uid(), 'staff_force_submit', _reason, jsonb_build_object('score_a',_score_a,'score_b',_score_b));
  RETURN jsonb_build_object('ok', true, 'result_id', new_id);
END $$;

-- Staff edit score on an approved result (recomputes via rollback + new result)
CREATE OR REPLACE FUNCTION public.staff_edit_match_score(
  _room_id uuid, _score_a integer, _score_b integer, _reason text DEFAULT NULL
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r public.clan_match_rooms%ROWTYPE; old_winner uuid;
BEGIN
  IF NOT public.is_match_staff(auth.uid(), _room_id) THEN RETURN jsonb_build_object('ok',false,'error','Not authorized'); END IF;
  SELECT * INTO r FROM public.clan_match_rooms WHERE id = _room_id;
  IF NOT FOUND THEN RETURN jsonb_build_object('ok',false,'error','Room not found'); END IF;
  old_winner := r.winner_clan_id;
  -- Reverse previous ELO/W-L if finalized
  IF r.status IN ('completed','walkover') AND old_winner IS NOT NULL THEN
    UPDATE public.clans SET wins = GREATEST(wins-1,0), elo = GREATEST(elo-25,0) WHERE id = old_winner;
    UPDATE public.clans SET losses = GREATEST(losses-1,0), elo = elo + 25
      WHERE id = CASE WHEN old_winner = r.clan_a_id THEN r.clan_b_id ELSE r.clan_a_id END;
  END IF;
  -- Reset room then insert new approved result (trigger reapplies ELO)
  UPDATE public.clan_match_rooms SET status='scheduled', winner_clan_id=NULL, finalized_at=NULL WHERE id = _room_id;
  PERFORM public.staff_force_submit_result(_room_id, _score_a, _score_b, COALESCE(_reason,'Staff edit score'), NULL);
  INSERT INTO public.clan_audit_logs(clan_id, actor_user_id, action, reason, new_value)
    VALUES (r.clan_a_id, auth.uid(), 'staff_edit_score', _reason, jsonb_build_object('score_a',_score_a,'score_b',_score_b));
  RETURN jsonb_build_object('ok', true);
END $$;

-- Staff rollback a finalized match
CREATE OR REPLACE FUNCTION public.staff_rollback_match(_room_id uuid, _reason text DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r public.clan_match_rooms%ROWTYPE;
BEGIN
  IF NOT public.is_match_staff(auth.uid(), _room_id) THEN RETURN jsonb_build_object('ok',false,'error','Not authorized'); END IF;
  SELECT * INTO r FROM public.clan_match_rooms WHERE id = _room_id;
  IF NOT FOUND THEN RETURN jsonb_build_object('ok',false,'error','Room not found'); END IF;
  IF r.winner_clan_id IS NOT NULL THEN
    UPDATE public.clans SET wins = GREATEST(wins-1,0), elo = GREATEST(elo-25,0) WHERE id = r.winner_clan_id;
    UPDATE public.clans SET losses = GREATEST(losses-1,0), elo = elo + 25
      WHERE id = CASE WHEN r.winner_clan_id = r.clan_a_id THEN r.clan_b_id ELSE r.clan_a_id END;
  END IF;
  UPDATE public.clan_match_results SET status='rejected' WHERE room_id = _room_id AND status='approved';
  UPDATE public.clan_match_rooms SET status='scheduled', winner_clan_id=NULL, finalized_at=NULL WHERE id = _room_id;
  INSERT INTO public.clan_audit_logs(clan_id, actor_user_id, action, reason)
    VALUES (r.clan_a_id, auth.uid(), 'staff_rollback', _reason);
  RETURN jsonb_build_object('ok', true);
END $$;

-- Staff walkover
CREATE OR REPLACE FUNCTION public.staff_walkover(_room_id uuid, _winner_clan_id uuid, _reason text DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r public.clan_match_rooms%ROWTYPE; loser uuid;
BEGIN
  IF NOT public.is_match_staff(auth.uid(), _room_id) THEN RETURN jsonb_build_object('ok',false,'error','Not authorized'); END IF;
  SELECT * INTO r FROM public.clan_match_rooms WHERE id = _room_id;
  IF NOT FOUND THEN RETURN jsonb_build_object('ok',false,'error','Room not found'); END IF;
  IF _winner_clan_id NOT IN (r.clan_a_id, r.clan_b_id) THEN RETURN jsonb_build_object('ok',false,'error','Invalid winner'); END IF;
  loser := CASE WHEN _winner_clan_id = r.clan_a_id THEN r.clan_b_id ELSE r.clan_a_id END;
  UPDATE public.clans SET wins = wins+1, elo = elo+15 WHERE id = _winner_clan_id;
  UPDATE public.clans SET losses = losses+1, elo = GREATEST(elo-15,0) WHERE id = loser;
  UPDATE public.clan_match_rooms SET status='walkover', winner_clan_id=_winner_clan_id, finalized_at=now() WHERE id = _room_id;
  INSERT INTO public.clan_audit_logs(clan_id, actor_user_id, action, reason)
    VALUES (loser, auth.uid(), 'staff_walkover_loss', _reason);
  INSERT INTO public.clan_audit_logs(clan_id, actor_user_id, action, reason)
    VALUES (_winner_clan_id, auth.uid(), 'staff_walkover_win', _reason);
  RETURN jsonb_build_object('ok', true);
END $$;

-- Staff disqualify (other clan wins)
CREATE OR REPLACE FUNCTION public.staff_disqualify_clan(_room_id uuid, _dq_clan_id uuid, _reason text DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r public.clan_match_rooms%ROWTYPE; winner uuid;
BEGIN
  IF NOT public.is_match_staff(auth.uid(), _room_id) THEN RETURN jsonb_build_object('ok',false,'error','Not authorized'); END IF;
  SELECT * INTO r FROM public.clan_match_rooms WHERE id = _room_id;
  IF NOT FOUND THEN RETURN jsonb_build_object('ok',false,'error','Room not found'); END IF;
  IF _dq_clan_id NOT IN (r.clan_a_id, r.clan_b_id) THEN RETURN jsonb_build_object('ok',false,'error','Invalid clan'); END IF;
  winner := CASE WHEN _dq_clan_id = r.clan_a_id THEN r.clan_b_id ELSE r.clan_a_id END;
  UPDATE public.clans SET wins = wins+1, elo = elo+15 WHERE id = winner;
  UPDATE public.clans SET losses = losses+1, elo = GREATEST(elo-30,0) WHERE id = _dq_clan_id;
  UPDATE public.clan_match_rooms SET status='disqualified', winner_clan_id=winner, finalized_at=now() WHERE id = _room_id;
  INSERT INTO public.clan_audit_logs(clan_id, actor_user_id, action, reason)
    VALUES (_dq_clan_id, auth.uid(), 'staff_disqualified', _reason);
  RETURN jsonb_build_object('ok', true);
END $$;

-- Staff delete match (soft: mark cancelled)
CREATE OR REPLACE FUNCTION public.staff_delete_match(_room_id uuid, _reason text DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r public.clan_match_rooms%ROWTYPE;
BEGIN
  IF NOT public.is_match_staff(auth.uid(), _room_id) THEN RETURN jsonb_build_object('ok',false,'error','Not authorized'); END IF;
  SELECT * INTO r FROM public.clan_match_rooms WHERE id = _room_id;
  IF NOT FOUND THEN RETURN jsonb_build_object('ok',false,'error','Room not found'); END IF;
  -- If finalized, reverse stats first
  IF r.winner_clan_id IS NOT NULL THEN
    UPDATE public.clans SET wins = GREATEST(wins-1,0), elo = GREATEST(elo-25,0) WHERE id = r.winner_clan_id;
    UPDATE public.clans SET losses = GREATEST(losses-1,0), elo = elo + 25
      WHERE id = CASE WHEN r.winner_clan_id = r.clan_a_id THEN r.clan_b_id ELSE r.clan_a_id END;
  END IF;
  UPDATE public.clan_match_rooms SET status='cancelled', winner_clan_id=NULL, finalized_at=NULL WHERE id = _room_id;
  INSERT INTO public.clan_audit_logs(clan_id, actor_user_id, action, reason)
    VALUES (r.clan_a_id, auth.uid(), 'staff_delete_match', _reason);
  RETURN jsonb_build_object('ok', true);
END $$;

-- === 20260502150124_4b1a360e-2cd0-4a90-a44b-9c94f862b595.sql ===

-- ============ PLAYERS: card fields ============
ALTER TABLE public.players
  ADD COLUMN IF NOT EXISTS player_elo integer NOT NULL DEFAULT 1000,
  ADD COLUMN IF NOT EXISTS overall_rating integer,
  ADD COLUMN IF NOT EXISTS card_position text,
  ADD COLUMN IF NOT EXISTS custom_attributes jsonb NOT NULL DEFAULT '{}'::jsonb;

-- ============ CLANS: free agents lock ============
ALTER TABLE public.clans
  ADD COLUMN IF NOT EXISTS free_agents_unlocked boolean NOT NULL DEFAULT false;

-- ============ Titles catalog ============
CREATE TABLE IF NOT EXISTS public.player_titles_catalog (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  label text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'general',
  icon text,
  color text DEFAULT '#22d3ee',
  rarity text NOT NULL DEFAULT 'common',
  auto_criteria jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.player_titles_catalog ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "titles_catalog read" ON public.player_titles_catalog;
CREATE POLICY "titles_catalog read" ON public.player_titles_catalog FOR SELECT USING (true);
DROP POLICY IF EXISTS "titles_catalog admin write" ON public.player_titles_catalog;
CREATE POLICY "titles_catalog admin write" ON public.player_titles_catalog FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- ============ Player titles assignments ============
CREATE TABLE IF NOT EXISTS public.player_titles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  title_code text NOT NULL REFERENCES public.player_titles_catalog(code) ON DELETE CASCADE,
  awarded_by uuid,
  awarded_at timestamptz NOT NULL DEFAULT now(),
  reason text,
  is_featured boolean NOT NULL DEFAULT false,
  UNIQUE(player_id, title_code)
);
ALTER TABLE public.player_titles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ptitles read" ON public.player_titles;
CREATE POLICY "ptitles read" ON public.player_titles FOR SELECT USING (true);

DROP POLICY IF EXISTS "ptitles write" ON public.player_titles;
CREATE POLICY "ptitles write" ON public.player_titles FOR ALL
  USING (
    public.is_admin(auth.uid())
    OR EXISTS (SELECT 1 FROM public.players p WHERE p.id = player_titles.player_id AND p.profile_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.players p
      JOIN public.clans c ON c.id = p.current_clan_id
      WHERE p.id = player_titles.player_id
        AND (c.captain_profile_id = auth.uid() OR c.owner_profile_id = auth.uid())
    )
  )
  WITH CHECK (
    public.is_admin(auth.uid())
    OR EXISTS (SELECT 1 FROM public.players p WHERE p.id = player_titles.player_id AND p.profile_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.players p
      JOIN public.clans c ON c.id = p.current_clan_id
      WHERE p.id = player_titles.player_id
        AND (c.captain_profile_id = auth.uid() OR c.owner_profile_id = auth.uid())
    )
  );

-- ============ Compute player overall rating ============
CREATE OR REPLACE FUNCTION public.compute_player_overall(_player_id uuid)
RETURNS integer
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  pl record;
  matches int;
  win_rate numeric;
  gd int;
  base numeric;
  elo_factor numeric;
  rating int;
BEGIN
  SELECT wins, losses, goals_scored, goals_conceded, ranking_points, player_elo
    INTO pl FROM public.players WHERE id = _player_id;
  IF pl IS NULL THEN RETURN NULL; END IF;

  matches := COALESCE(pl.wins,0) + COALESCE(pl.losses,0);
  IF matches < 5 THEN RETURN NULL; END IF;

  win_rate := pl.wins::numeric / GREATEST(matches,1);
  gd := COALESCE(pl.goals_scored,0) - COALESCE(pl.goals_conceded,0);
  elo_factor := LEAST(GREATEST((pl.player_elo - 800)::numeric / 800, -1), 2);

  base := 50
        + (win_rate * 30)
        + (LEAST(gd, 50)::numeric / 50 * 10)
        + (elo_factor * 10);

  rating := GREATEST(1, LEAST(99, ROUND(base)::int));
  RETURN rating;
END;
$$;

-- ============ Seed titles catalog ============
INSERT INTO public.player_titles_catalog (code, label, description, category, color, rarity) VALUES
  ('esports_player','eSports Player','Officially recognised competitive player','identity','#22d3ee','common'),
  ('streamer','Streamer','Active content creator on Twitch/YouTube','identity','#a855f7','common'),
  ('content_creator','Content Creator','Creates highlights, guides or tactics videos','identity','#ec4899','common'),
  ('coach','Coach','Trains other players or full clans','identity','#f97316','uncommon'),
  ('analyst','Analyst','Breaks down opposition and tactics','identity','#0ea5e9','uncommon'),
  ('veteran','Veteran','3+ years competing','identity','#94a3b8','uncommon'),
  ('rookie','Rookie','New to competitive play','identity','#10b981','common'),
  ('captain','Captain','Leads a competitive clan','identity','#facc15','rare'),
  ('founder','Founder','Helped build a clan or community','identity','#fbbf24','rare'),
  ('legend','Legend','Hall of fame caliber','identity','#fb7185','legendary'),
  ('goal_hunter','GoalHunter','Constant scoring threat','play','#ef4444','uncommon'),
  ('finisher','Clinical Finisher','High conversion rate','play','#dc2626','rare'),
  ('sniper','Sniper','Elite from outside the box','play','#f43f5e','rare'),
  ('defensive_unit','Defensive Unit','Locks down the back','play','#3b82f6','uncommon'),
  ('the_wall','The Wall','Best-in-class defender','play','#1d4ed8','rare'),
  ('playmaker','Playmaker','Creates everything','play','#a78bfa','rare'),
  ('maestro','Maestro','Conducts tempo of every game','play','#7c3aed','legendary'),
  ('engine','Engine','Box-to-box workhorse','play','#22c55e','uncommon'),
  ('speed_demon','Speed Demon','Pace kills','play','#84cc16','common'),
  ('dribble_king','Dribble King','Skill move specialist','play','#eab308','rare'),
  ('clutch','Clutch','Performs in the biggest moments','play','#fb923c','rare'),
  ('penalty_god','Penalty God','Never misses from the spot','play','#f59e0b','rare'),
  ('free_kick_specialist','Free-Kick Specialist','Set-piece weapon','play','#c084fc','rare'),
  ('iron_keeper','Iron Keeper','Elite goalkeeper','play','#0891b2','rare'),
  ('mvp','MVP','Most Valuable Player honour','achievement','#f59e0b','legendary'),
  ('champion','Champion','Won a major title','achievement','#fbbf24','legendary'),
  ('tournament_winner','Tournament Winner','Lifted a tournament trophy','achievement','#facc15','rare'),
  ('league_winner','League Winner','Won a league season','achievement','#fde047','rare'),
  ('top_scorer','Top Scorer','Golden boot','achievement','#f59e0b','rare'),
  ('clean_sheet_master','Clean Sheet Master','Multiple clean sheets in a row','achievement','#0284c7','uncommon'),
  ('unbeaten','Unbeaten','10+ match unbeaten streak','achievement','#16a34a','rare'),
  ('comeback_king','Comeback King','Specialty: late wins','achievement','#ea580c','uncommon'),
  ('giant_slayer','Giant Slayer','Beat a much higher seed','achievement','#be185d','rare'),
  ('community_hero','Community Hero','Major contribution to community','community','#06b6d4','rare'),
  ('referee','Referee','Trusted match official','community','#64748b','uncommon'),
  ('host','Host','Runs tournaments or events','community','#0ea5e9','uncommon'),
  ('mentor','Mentor','Helps others improve','community','#22d3ee','common'),
  ('scout','Scout','Spots talent before others','community','#14b8a6','uncommon'),
  ('og','OG','Original era player','community','#a16207','rare'),
  ('rising_star','Rising Star','Breakout performer','community','#22d3ee','rare'),
  ('mobile_main','Mobile Main','Plays on touch controls','identity','#10b981','common'),
  ('controller_main','Controller Main','Plays on controller','identity','#3b82f6','common')
ON CONFLICT (code) DO NOTHING;


-- === 20260502150933_45bf0c1a-6468-466a-8001-a6b57a4e6455.sql ===

-- ===== REGION CATALOG =====
CREATE TABLE IF NOT EXISTS public.region_catalog (
  code text PRIMARY KEY,
  label text NOT NULL,
  continent text,
  flag text,
  sort_order int NOT NULL DEFAULT 100,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.region_catalog ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "regions read" ON public.region_catalog;
CREATE POLICY "regions read" ON public.region_catalog FOR SELECT USING (true);
DROP POLICY IF EXISTS "regions admin write" ON public.region_catalog;
CREATE POLICY "regions admin write" ON public.region_catalog FOR ALL
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

INSERT INTO public.region_catalog (code, label, continent, flag, sort_order) VALUES
  ('GLB','Global','Global','ðŸŒ',1),
  ('EU','Europe','Europe','ðŸ‡ªðŸ‡º',10),
  ('NA','North America','Americas','ðŸŒŽ',20),
  ('SA','South America','Americas','ðŸŒŽ',30),
  ('LATAM','Latin America','Americas','ðŸŒŽ',31),
  ('ME','Middle East','MENA','ðŸ•Œ',40),
  ('MENA','MENA','MENA','ðŸ•Œ',41),
  ('NAF','North Africa','Africa','ðŸŒ',50),
  ('WAF','West Africa','Africa','ðŸŒ',51),
  ('EAF','East Africa','Africa','ðŸŒ',52),
  ('SAF','Southern Africa','Africa','ðŸŒ',53),
  ('CAF','Central Africa','Africa','ðŸŒ',54),
  ('NEC','Nigeria E-Connect','Africa','ðŸ‡³ðŸ‡¬',55),
  ('GHA','Ghana','Africa','ðŸ‡¬ðŸ‡­',56),
  ('KEN','Kenya','Africa','ðŸ‡°ðŸ‡ª',57),
  ('RSA','South Africa','Africa','ðŸ‡¿ðŸ‡¦',58),
  ('EGY','Egypt','MENA','ðŸ‡ªðŸ‡¬',59),
  ('MAR','Morocco','MENA','ðŸ‡²ðŸ‡¦',60),
  ('TUR','TÃ¼rkiye','Europe','ðŸ‡¹ðŸ‡·',61),
  ('NLD','Netherlands','Europe','ðŸ‡³ðŸ‡±',62),
  ('FRA','France','Europe','ðŸ‡«ðŸ‡·',63),
  ('ESP','Spain','Europe','ðŸ‡ªðŸ‡¸',64),
  ('PRT','Portugal','Europe','ðŸ‡µðŸ‡¹',65),
  ('GBR','United Kingdom','Europe','ðŸ‡¬ðŸ‡§',66),
  ('DEU','Germany','Europe','ðŸ‡©ðŸ‡ª',67),
  ('ITA','Italy','Europe','ðŸ‡®ðŸ‡¹',68),
  ('SEA','Southeast Asia','Asia','ðŸŒ',70),
  ('IDN','Indonesia','Asia','ðŸ‡®ðŸ‡©',71),
  ('MYS','Malaysia','Asia','ðŸ‡²ðŸ‡¾',72),
  ('JPN','Japan','Asia','ðŸ‡¯ðŸ‡µ',73),
  ('CHN','China','Asia','ðŸ‡¨ðŸ‡³',74),
  ('IND','India','Asia','ðŸ‡®ðŸ‡³',75),
  ('MMR','Myanmar','Asia','ðŸ‡²ðŸ‡²',76),
  ('OCE','Oceania','Oceania','ðŸŒ',80),
  ('AUS','Australia','Oceania','ðŸ‡¦ðŸ‡º',81),
  ('BRA','Brazil','Americas','ðŸ‡§ðŸ‡·',90),
  ('ARG','Argentina','Americas','ðŸ‡¦ðŸ‡·',91),
  ('USA','United States','Americas','ðŸ‡ºðŸ‡¸',92),
  ('CAN','Canada','Americas','ðŸ‡¨ðŸ‡¦',93),
  ('MEX','Mexico','Americas','ðŸ‡²ðŸ‡½',94)
ON CONFLICT (code) DO NOTHING;

-- ===== CLANS: disband / merge tracking =====
ALTER TABLE public.clans
  ADD COLUMN IF NOT EXISTS disbanded_at timestamptz,
  ADD COLUMN IF NOT EXISTS merged_into_clan_id uuid REFERENCES public.clans(id) ON DELETE SET NULL;

-- ===== CLAN MERGES =====
CREATE TABLE IF NOT EXISTS public.clan_merges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_clan_id uuid NOT NULL REFERENCES public.clans(id) ON DELETE CASCADE,
  target_clan_id uuid NOT NULL REFERENCES public.clans(id) ON DELETE CASCADE,
  proposed_by uuid,
  status text NOT NULL DEFAULT 'pending', -- pending, accepted, finalized, rejected, cancelled
  reason text,
  source_accepted_at timestamptz,
  target_accepted_at timestamptz,
  finalized_at timestamptz,
  finalized_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.clan_merges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "merges public read" ON public.clan_merges;
CREATE POLICY "merges public read" ON public.clan_merges FOR SELECT USING (true);

DROP POLICY IF EXISTS "merges captain insert" ON public.clan_merges;
CREATE POLICY "merges captain insert" ON public.clan_merges FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.clans c WHERE c.id = source_clan_id AND (c.captain_profile_id = auth.uid() OR c.owner_profile_id = auth.uid()))
  OR public.is_admin(auth.uid())
);

DROP POLICY IF EXISTS "merges involved update" ON public.clan_merges;
CREATE POLICY "merges involved update" ON public.clan_merges FOR UPDATE USING (
  public.is_admin(auth.uid())
  OR EXISTS (SELECT 1 FROM public.clans c WHERE c.id IN (source_clan_id, target_clan_id) AND (c.captain_profile_id = auth.uid() OR c.owner_profile_id = auth.uid()))
);

CREATE OR REPLACE FUNCTION public.finalize_clan_merge(_merge_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  m public.clan_merges%ROWTYPE;
  src public.clans%ROWTYPE;
  tgt public.clans%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL THEN RETURN jsonb_build_object('ok',false,'error','Sign in required'); END IF;
  SELECT * INTO m FROM public.clan_merges WHERE id = _merge_id FOR UPDATE;
  IF NOT FOUND THEN RETURN jsonb_build_object('ok',false,'error','Merge not found'); END IF;
  IF m.status NOT IN ('pending','accepted') THEN RETURN jsonb_build_object('ok',false,'error','Already settled'); END IF;
  IF m.source_accepted_at IS NULL OR m.target_accepted_at IS NULL THEN
    RETURN jsonb_build_object('ok',false,'error','Both clans must accept first');
  END IF;
  SELECT * INTO src FROM public.clans WHERE id = m.source_clan_id FOR UPDATE;
  SELECT * INTO tgt FROM public.clans WHERE id = m.target_clan_id FOR UPDATE;
  IF NOT (public.is_admin(auth.uid())
    OR (tgt.community_id IS NOT NULL AND public.is_community_admin(auth.uid(), tgt.community_id))) THEN
    RETURN jsonb_build_object('ok',false,'error','Only admins or community admins can finalize');
  END IF;

  -- Move members (skip duplicates)
  INSERT INTO public.clan_members (clan_id, player_id, member_role, title, joined_at)
    SELECT tgt.id, cm.player_id, cm.member_role, cm.title, cm.joined_at
    FROM public.clan_members cm WHERE cm.clan_id = src.id
    ON CONFLICT DO NOTHING;
  -- Reassign players' current clan
  UPDATE public.players SET current_clan_id = tgt.id WHERE current_clan_id = src.id;
  -- Move trophies
  UPDATE public.clan_trophies SET clan_id = tgt.id WHERE clan_id = src.id;
  -- Sum stats
  UPDATE public.clans
    SET wins = wins + COALESCE(src.wins,0),
        losses = losses + COALESCE(src.losses,0),
        elo = GREATEST(elo, COALESCE(src.elo, elo))
    WHERE id = tgt.id;

  -- Disband source
  UPDATE public.clans SET disbanded_at = now(), merged_into_clan_id = tgt.id, recruitment_status = 'closed' WHERE id = src.id;

  UPDATE public.clan_merges SET status='finalized', finalized_at=now(), finalized_by=auth.uid() WHERE id = _merge_id;

  INSERT INTO public.clan_audit_logs (clan_id, actor_user_id, action, reason, new_value)
    VALUES (tgt.id, auth.uid(), 'merge_in', m.reason, jsonb_build_object('source_clan_id', src.id));
  INSERT INTO public.clan_audit_logs (clan_id, actor_user_id, action, reason, new_value)
    VALUES (src.id, auth.uid(), 'merge_out', m.reason, jsonb_build_object('target_clan_id', tgt.id));

  RETURN jsonb_build_object('ok', true);
END;
$$;

-- ===== PLAYER LINK CODES =====
CREATE TABLE IF NOT EXISTS public.player_link_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  player_id uuid NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  clan_id uuid REFERENCES public.clans(id) ON DELETE SET NULL,
  community_id uuid,
  created_by uuid NOT NULL,           -- the clan leader's user id
  status text NOT NULL DEFAULT 'unclaimed', -- unclaimed | pending_approval | approved | rejected | revoked
  claimed_by uuid,                    -- gamer's user id who entered the code
  claimed_at timestamptz,
  approved_at timestamptz,
  approved_by uuid,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_link_codes_status ON public.player_link_codes(status);
CREATE INDEX IF NOT EXISTS idx_link_codes_clan ON public.player_link_codes(clan_id);
ALTER TABLE public.player_link_codes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "linkcodes leader read" ON public.player_link_codes;
CREATE POLICY "linkcodes leader read" ON public.player_link_codes FOR SELECT USING (
  public.is_admin(auth.uid())
  OR created_by = auth.uid()
  OR claimed_by = auth.uid()
  OR (clan_id IS NOT NULL AND EXISTS (SELECT 1 FROM public.clans c WHERE c.id = clan_id AND (c.captain_profile_id = auth.uid() OR c.owner_profile_id = auth.uid())))
  OR (community_id IS NOT NULL AND public.is_community_admin(auth.uid(), community_id))
);

DROP POLICY IF EXISTS "linkcodes leader insert" ON public.player_link_codes;
CREATE POLICY "linkcodes leader insert" ON public.player_link_codes FOR INSERT TO authenticated WITH CHECK (
  public.is_admin(auth.uid())
  OR (clan_id IS NOT NULL AND EXISTS (SELECT 1 FROM public.clans c WHERE c.id = clan_id AND (c.captain_profile_id = auth.uid() OR c.owner_profile_id = auth.uid())))
);

-- Updates flow exclusively through SECURITY DEFINER functions below. No general UPDATE policy.

-- Leader creates a player + link code in one go
CREATE OR REPLACE FUNCTION public.leader_create_player(_clan_id uuid, _gamertag text, _country text DEFAULT NULL, _flag text DEFAULT NULL, _role text DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  c public.clans%ROWTYPE;
  new_pid uuid;
  new_code text;
BEGIN
  IF auth.uid() IS NULL THEN RETURN jsonb_build_object('ok',false,'error','Sign in required'); END IF;
  SELECT * INTO c FROM public.clans WHERE id = _clan_id;
  IF NOT FOUND THEN RETURN jsonb_build_object('ok',false,'error','Clan not found'); END IF;
  IF NOT (public.is_admin(auth.uid()) OR c.captain_profile_id = auth.uid() OR c.owner_profile_id = auth.uid()) THEN
    RETURN jsonb_build_object('ok',false,'error','Not authorized');
  END IF;
  IF _gamertag IS NULL OR length(trim(_gamertag)) = 0 THEN
    RETURN jsonb_build_object('ok',false,'error','Gamertag required');
  END IF;

  INSERT INTO public.players (gamertag, country, flag, role, current_clan_id, region)
    VALUES (trim(_gamertag), _country, _flag, _role, _clan_id, c.region)
    RETURNING id INTO new_pid;

  INSERT INTO public.clan_members (clan_id, player_id, member_role) VALUES (_clan_id, new_pid, 'player');

  new_code := 'KAF-LNK-' || upper(substring(encode(gen_random_bytes(6),'hex') from 1 for 8));
  INSERT INTO public.player_link_codes (code, player_id, clan_id, community_id, created_by, expires_at)
    VALUES (new_code, new_pid, _clan_id, c.community_id, auth.uid(), now() + interval '60 days');

  INSERT INTO public.clan_audit_logs (clan_id, actor_user_id, action, reason, new_value)
    VALUES (_clan_id, auth.uid(), 'leader_create_player', 'Created player + link code', jsonb_build_object('player_id', new_pid, 'gamertag', _gamertag));

  RETURN jsonb_build_object('ok', true, 'player_id', new_pid, 'link_code', new_code);
END;
$$;

-- Gamer claims a link code -> sets pending_approval and notifies the leader + community admin
CREATE OR REPLACE FUNCTION public.request_player_link(_code text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  rec public.player_link_codes%ROWTYPE;
  existing uuid;
  cname text;
  ca record;
BEGIN
  IF auth.uid() IS NULL THEN RETURN jsonb_build_object('ok',false,'error','Sign in required'); END IF;
  SELECT * INTO rec FROM public.player_link_codes WHERE code = _code FOR UPDATE;
  IF NOT FOUND THEN RETURN jsonb_build_object('ok',false,'error','Invalid code'); END IF;
  IF rec.status NOT IN ('unclaimed') THEN RETURN jsonb_build_object('ok',false,'error','Code already claimed or settled'); END IF;
  IF rec.expires_at IS NOT NULL AND rec.expires_at < now() THEN RETURN jsonb_build_object('ok',false,'error','Code expired'); END IF;

  SELECT profile_id INTO existing FROM public.players WHERE id = rec.player_id;
  IF existing IS NOT NULL AND existing <> auth.uid() THEN
    RETURN jsonb_build_object('ok',false,'error','Player already linked to another account');
  END IF;

  UPDATE public.player_link_codes SET status='pending_approval', claimed_by = auth.uid(), claimed_at = now() WHERE id = rec.id;

  SELECT name INTO cname FROM public.clans WHERE id = rec.clan_id;
  -- Notify leader
  PERFORM public.notify_user(rec.created_by, 'player_link_request',
    'Player link request',
    'A user is requesting to claim a player you created in ' || COALESCE(cname,'your clan') || '. Open the clan settings to approve.',
    '/clans/' || rec.clan_id,
    jsonb_build_object('code', rec.code, 'player_id', rec.player_id));
  -- Notify community admins
  IF rec.community_id IS NOT NULL THEN
    FOR ca IN SELECT user_id FROM public.community_admins WHERE community_id = rec.community_id LOOP
      PERFORM public.notify_user(ca.user_id, 'player_link_request',
        'Player claim awaiting approval',
        'A clan-created player in your community is being claimed.',
        '/clans/' || rec.clan_id,
        jsonb_build_object('code', rec.code, 'player_id', rec.player_id, 'community_admin', true));
    END LOOP;
  END IF;

  RETURN jsonb_build_object('ok', true, 'status', 'pending_approval');
END;
$$;

-- Leader approves the link
CREATE OR REPLACE FUNCTION public.approve_player_link(_code text, _approve boolean)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  rec public.player_link_codes%ROWTYPE;
  c public.clans%ROWTYPE;
  ca record;
BEGIN
  IF auth.uid() IS NULL THEN RETURN jsonb_build_object('ok',false,'error','Sign in required'); END IF;
  SELECT * INTO rec FROM public.player_link_codes WHERE code = _code FOR UPDATE;
  IF NOT FOUND THEN RETURN jsonb_build_object('ok',false,'error','Code not found'); END IF;
  IF rec.status <> 'pending_approval' THEN RETURN jsonb_build_object('ok',false,'error','Nothing to approve'); END IF;
  SELECT * INTO c FROM public.clans WHERE id = rec.clan_id;
  IF NOT (public.is_admin(auth.uid()) OR rec.created_by = auth.uid()
    OR (c.id IS NOT NULL AND (c.captain_profile_id = auth.uid() OR c.owner_profile_id = auth.uid()))
    OR (c.community_id IS NOT NULL AND public.is_community_admin(auth.uid(), c.community_id))) THEN
    RETURN jsonb_build_object('ok',false,'error','Not authorized');
  END IF;

  IF _approve THEN
    UPDATE public.players SET profile_id = rec.claimed_by WHERE id = rec.player_id;
    UPDATE public.player_link_codes SET status='approved', approved_at=now(), approved_by=auth.uid() WHERE id = rec.id;
    PERFORM public.notify_user(rec.claimed_by, 'player_link_approved',
      'Player profile linked',
      'Your account has been linked to the clan-created player. You can now manage it from your profile.',
      '/profile', jsonb_build_object('player_id', rec.player_id));
  ELSE
    UPDATE public.player_link_codes SET status='rejected', approved_at=now(), approved_by=auth.uid() WHERE id = rec.id;
    PERFORM public.notify_user(rec.claimed_by, 'player_link_rejected',
      'Player link rejected',
      'Your claim request was rejected by the clan leader.',
      '/profile', jsonb_build_object('player_id', rec.player_id));
  END IF;

  -- Notify community admins of decision
  IF c.community_id IS NOT NULL THEN
    FOR ca IN SELECT user_id FROM public.community_admins WHERE community_id = c.community_id LOOP
      PERFORM public.notify_user(ca.user_id, 'player_link_decided',
        'Player claim decided',
        'A player claim in your community was ' || (CASE WHEN _approve THEN 'approved' ELSE 'rejected' END) || '.',
        '/clans/' || c.id,
        jsonb_build_object('code', rec.code, 'player_id', rec.player_id));
    END LOOP;
  END IF;
  RETURN jsonb_build_object('ok', true);
END;
$$;

-- ===== MORE TITLES =====
INSERT INTO public.player_titles_catalog (code, label, description, category, color, rarity) VALUES
  ('grinder','Grinder','Plays an absurd amount of matches','identity','#22d3ee','uncommon'),
  ('night_owl','Night Owl','Plays mostly late nights','identity','#94a3b8','common'),
  ('weekend_warrior','Weekend Warrior','Tournaments on weekends','identity','#84cc16','common'),
  ('tournament_regular','Tournament Regular','In every event','identity','#0ea5e9','uncommon'),
  ('cup_specialist','Cup Specialist','Wins knockouts more than league','play','#f59e0b','rare'),
  ('league_specialist','League Specialist','Consistent league performer','play','#10b981','rare'),
  ('counter_attacker','Counter Attacker','Devastating on the break','play','#ef4444','uncommon'),
  ('possession_master','Possession Master','Owns the ball','play','#22c55e','uncommon'),
  ('high_press','High Press','Suffocates the opponent','play','#16a34a','uncommon'),
  ('bus_driver','Bus Driver','Master of low-block','play','#475569','uncommon'),
  ('skill_machine','Skill Machine','Ridiculous skill moves','play','#fb7185','rare'),
  ('one_touch','One-Touch Wizard','Pure first-time football','play','#a78bfa','rare'),
  ('long_shot','Long Shot Hunter','Bombs from distance','play','#f43f5e','uncommon'),
  ('header_master','Header Master','Aerial dominance','play','#0284c7','uncommon'),
  ('finesse_finisher','Finesse Finisher','Curlers into the corner','play','#e11d48','rare'),
  ('one_v_one','1v1 Specialist','Beats keepers cold','play','#fb923c','rare'),
  ('pen_taker','Pen Taker','Designated penalty taker','play','#f59e0b','common'),
  ('captain_armband','Captain Armband','Wears the band','identity','#facc15','uncommon'),
  ('vice_captain','Vice Captain','Backup leader','identity','#fde68a','common'),
  ('iron_man','Iron Man','Never misses a match','achievement','#94a3b8','uncommon'),
  ('record_breaker','Record Breaker','Holds a community record','achievement','#fbbf24','legendary'),
  ('hat_trick_hero','Hat-Trick Hero','3+ goals in a match','achievement','#ef4444','rare'),
  ('triple_double','Triple Double','3 wins, 3 clean sheets, 3 goals in a row','achievement','#22d3ee','rare'),
  ('derby_king','Derby King','Wins the local rivalry','achievement','#dc2626','rare'),
  ('upset_specialist','Upset Specialist','Beats higher seeds regularly','achievement','#be123c','rare'),
  ('finals_mvp','Finals MVP','MVP of a final','achievement','#facc15','legendary'),
  ('group_winner','Group Winner','Topped a group stage','achievement','#84cc16','common'),
  ('kafconnect_og','KAFConnect OG','Day-one member','community','#a16207','rare'),
  ('beta_tester','Beta Tester','Helped during beta','community','#64748b','uncommon'),
  ('pro_aspirant','Pro Aspirant','Aiming at full pro','identity','#06b6d4','common'),
  ('semi_pro','Semi-Pro','Plays semi-professionally','identity','#0ea5e9','uncommon'),
  ('pro_player','Pro Player','Officially pro','identity','#8b5cf6','rare'),
  ('influencer','Influencer','Major social presence','identity','#ec4899','rare'),
  ('caster','Caster / Commentator','Calls matches','identity','#f97316','uncommon'),
  ('event_organizer','Event Organizer','Runs tournaments','community','#0ea5e9','rare'),
  ('moderator','Moderator','Keeps the community safe','community','#475569','uncommon'),
  ('clan_recruiter','Clan Recruiter','Brings in new players','community','#06b6d4','common'),
  ('verified_pro','Verified Pro','Konami-confirmed','identity','#10b981','legendary'),
  ('iconic','Iconic','Unmistakable presence','identity','#f59e0b','legendary'),
  ('the_general','The General','Total tactical control','play','#7c3aed','legendary'),
  ('the_machine','The Machine','Mechanical precision','play','#0891b2','legendary'),
  ('mr_consistent','Mr. Consistent','Same level every match','play','#22c55e','rare'),
  ('cold_blooded','Cold Blooded','Zero nerves in finals','play','#06b6d4','rare'),
  ('comeback_specialist','Comeback Specialist','Recovers losing positions','play','#ea580c','rare'),
  ('fox_in_the_box','Fox in the Box','Always on the rebound','play','#fb7185','uncommon'),
  ('press_resistant','Press Resistant','Plays out of pressure','play','#22d3ee','uncommon'),
  ('libero','Libero','Sweeper-style defender','play','#1d4ed8','uncommon'),
  ('false_nine','False 9','Drops deep, kills you','play','#a855f7','rare'),
  ('inverted_winger','Inverted Winger','Cuts inside','play','#c084fc','common')
ON CONFLICT (code) DO NOTHING;


-- === 20260502152059_cd21973d-afa4-43b8-9b9d-c99dceddb0bf.sql ===
-- =========================================================
-- Wave C: Guards, anti-abuse, and clan moderators
-- =========================================================

-- 1) CLAN MODERATORS table (used now by Recruit/Settings, ready for chat/feed in next waves)
CREATE TABLE IF NOT EXISTS public.clan_moderators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clan_id uuid NOT NULL REFERENCES public.clans(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  scopes text[] NOT NULL DEFAULT ARRAY['chat','feed','recruit']::text[],
  appointed_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (clan_id, user_id)
);

ALTER TABLE public.clan_moderators ENABLE ROW LEVEL SECURITY;

CREATE POLICY "mods public read" ON public.clan_moderators
  FOR SELECT USING (true);

CREATE POLICY "mods captain manage" ON public.clan_moderators
  FOR ALL
  USING (
    public.is_admin(auth.uid())
    OR EXISTS (SELECT 1 FROM public.clans c WHERE c.id = clan_moderators.clan_id
               AND (c.captain_profile_id = auth.uid() OR c.owner_profile_id = auth.uid()))
  )
  WITH CHECK (
    public.is_admin(auth.uid())
    OR EXISTS (SELECT 1 FROM public.clans c WHERE c.id = clan_moderators.clan_id
               AND (c.captain_profile_id = auth.uid() OR c.owner_profile_id = auth.uid()))
  );

-- Helper: is_clan_moderator
CREATE OR REPLACE FUNCTION public.is_clan_moderator(_user_id uuid, _clan_id uuid, _scope text DEFAULT NULL)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT public.is_admin(_user_id)
    OR EXISTS (SELECT 1 FROM public.clans c WHERE c.id = _clan_id
               AND (c.captain_profile_id = _user_id OR c.owner_profile_id = _user_id))
    OR EXISTS (SELECT 1 FROM public.clan_moderators m
               WHERE m.clan_id = _clan_id AND m.user_id = _user_id
                 AND (_scope IS NULL OR _scope = ANY(m.scopes)));
$$;

-- 2) GUARDS / ANTI-ABUSE

-- 2a) Prevent duplicate gamertag inside the same clan (case-insensitive)
CREATE UNIQUE INDEX IF NOT EXISTS idx_players_clan_gamertag_unique
  ON public.players (current_clan_id, lower(gamertag))
  WHERE current_clan_id IS NOT NULL;

-- 2b) Prevent same user from being claimer AND creator of a link code (self-claim)
CREATE OR REPLACE FUNCTION public.guard_player_link_self_claim()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.claimed_by IS NOT NULL AND NEW.claimed_by = NEW.created_by THEN
    RAISE EXCEPTION 'You cannot claim a player profile you created yourself';
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_guard_link_self_claim ON public.player_link_codes;
CREATE TRIGGER trg_guard_link_self_claim
  BEFORE UPDATE ON public.player_link_codes
  FOR EACH ROW EXECUTE FUNCTION public.guard_player_link_self_claim();

-- 2c) Prevent more than 5 pending join requests per player at once
CREATE OR REPLACE FUNCTION public.guard_join_request_spam()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE pending_count int;
BEGIN
  SELECT COUNT(*) INTO pending_count FROM public.clan_join_requests
    WHERE player_id = NEW.player_id AND status = 'pending';
  IF pending_count >= 5 THEN
    RAISE EXCEPTION 'You already have 5 pending join requests. Wait for responses or cancel some.';
  END IF;
  -- Also block if player already has the same pending request to the same clan
  IF EXISTS (SELECT 1 FROM public.clan_join_requests
             WHERE player_id = NEW.player_id AND clan_id = NEW.clan_id AND status = 'pending') THEN
    RAISE EXCEPTION 'You already have a pending request to this clan';
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_guard_join_spam ON public.clan_join_requests;
CREATE TRIGGER trg_guard_join_spam
  BEFORE INSERT ON public.clan_join_requests
  FOR EACH ROW EXECUTE FUNCTION public.guard_join_request_spam();

-- 2d) Prevent duplicate active invites to the same player from the same clan
CREATE OR REPLACE FUNCTION public.guard_duplicate_invite()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.clan_invites
             WHERE clan_id = NEW.clan_id AND invited_player_id = NEW.invited_player_id AND status = 'pending') THEN
    RAISE EXCEPTION 'This player already has a pending invite from your clan';
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_guard_dupe_invite ON public.clan_invites;
CREATE TRIGGER trg_guard_dupe_invite
  BEFORE INSERT ON public.clan_invites
  FOR EACH ROW EXECUTE FUNCTION public.guard_duplicate_invite();

-- 2e) Helper: can a user create another clan? (cap: 1 owned clan unless admin)
CREATE OR REPLACE FUNCTION public.user_can_create_clan(_user_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.is_admin(_user_id)
    OR (
      _user_id IS NOT NULL
      AND (SELECT COUNT(*) FROM public.clans
           WHERE owner_profile_id = _user_id AND disbanded_at IS NULL) < 1
    );
$$;

-- 2f) Tighten clans insert RLS: must also pass user_can_create_clan
DROP POLICY IF EXISTS "clans gated insert" ON public.clans;
CREATE POLICY "clans gated insert" ON public.clans
FOR INSERT TO authenticated
WITH CHECK (
  public.is_admin(auth.uid())
  OR (
    public.user_can_create_clan(auth.uid())
    AND (
      ((community_id IS NOT NULL) AND public.is_community_admin(auth.uid(), community_id))
      OR public.user_has_valid_clan_token(auth.uid())
    )
  )
);

-- 2g) Tag uniqueness per region (case-insensitive). Active clans only.
CREATE UNIQUE INDEX IF NOT EXISTS idx_clans_region_tag_unique
  ON public.clans (lower(region), lower(tag))
  WHERE disbanded_at IS NULL AND region IS NOT NULL;

-- 3) Cleanup helper (callable by admins) to expire stale items
CREATE OR REPLACE FUNCTION public.expire_stale_recruitment(_days int DEFAULT 30)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE n_inv int; n_join int; n_link int;
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Admin only');
  END IF;
  UPDATE public.clan_invites SET status='expired'
    WHERE status='pending' AND created_at < now() - (_days || ' days')::interval;
  GET DIAGNOSTICS n_inv = ROW_COUNT;
  UPDATE public.clan_join_requests SET status='expired'
    WHERE status='pending' AND created_at < now() - (_days || ' days')::interval;
  GET DIAGNOSTICS n_join = ROW_COUNT;
  UPDATE public.player_link_codes SET status='expired'
    WHERE status IN ('unclaimed','pending_approval')
      AND expires_at IS NOT NULL AND expires_at < now();
  GET DIAGNOSTICS n_link = ROW_COUNT;
  RETURN jsonb_build_object('ok', true, 'expired_invites', n_inv,
    'expired_joins', n_join, 'expired_links', n_link);
END $$;

-- 4) Captain action: cancel a join request issued to my clan
-- (already covered by RLS update policy, but provide RPC for clarity / atomic handling)
CREATE OR REPLACE FUNCTION public.captain_decide_join_request(_req_id uuid, _accept boolean)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  r public.clan_join_requests%ROWTYPE; c public.clans%ROWTYPE; pid uuid;
BEGIN
  IF auth.uid() IS NULL THEN RETURN jsonb_build_object('ok',false,'error','Sign in required'); END IF;
  SELECT * INTO r FROM public.clan_join_requests WHERE id = _req_id FOR UPDATE;
  IF NOT FOUND THEN RETURN jsonb_build_object('ok',false,'error','Request not found'); END IF;
  IF r.status <> 'pending' THEN RETURN jsonb_build_object('ok',false,'error','Already decided'); END IF;
  SELECT * INTO c FROM public.clans WHERE id = r.clan_id;
  IF NOT (public.is_admin(auth.uid())
    OR c.captain_profile_id = auth.uid() OR c.owner_profile_id = auth.uid()
    OR public.is_clan_moderator(auth.uid(), c.id, 'recruit')) THEN
    RETURN jsonb_build_object('ok',false,'error','Not authorized');
  END IF;

  UPDATE public.clan_join_requests SET status = CASE WHEN _accept THEN 'accepted' ELSE 'rejected' END
    WHERE id = r.id;

  IF _accept THEN
    -- Insert as member (skip if already a member)
    INSERT INTO public.clan_members (clan_id, player_id, member_role)
      VALUES (r.clan_id, r.player_id, 'player')
      ON CONFLICT DO NOTHING;
    UPDATE public.players SET current_clan_id = r.clan_id WHERE id = r.player_id;
    -- Notify player
    SELECT profile_id INTO pid FROM public.players WHERE id = r.player_id;
    PERFORM public.notify_user(pid, 'join_accepted', 'Welcome to the clan',
      'Your join request was accepted by ' || c.name, '/clans/' || c.id);
  ELSE
    SELECT profile_id INTO pid FROM public.players WHERE id = r.player_id;
    PERFORM public.notify_user(pid, 'join_rejected', 'Join request rejected',
      'Your join request to ' || c.name || ' was rejected', '/clans');
  END IF;

  RETURN jsonb_build_object('ok', true);
END $$;

-- === 20260502152652_a11951a8-fd44-4489-89cb-fcf07be55e02.sql ===

-- Playstyle title auto-derivation (Wave D)
CREATE OR REPLACE FUNCTION public.derive_player_playstyle_titles(_player_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  pl record;
  matches int;
  win_rate numeric;
  gpm numeric;  -- goals per match
  cpm numeric;  -- conceded per match
  gd int;
  added text[] := ARRAY[]::text[];
  candidate text;
  candidates text[];
BEGIN
  SELECT wins, losses, goals_scored, goals_conceded, ranking_points, player_elo, role
    INTO pl FROM public.players WHERE id = _player_id;
  IF pl IS NULL THEN RETURN jsonb_build_object('ok',false,'error','Player not found'); END IF;

  matches := COALESCE(pl.wins,0) + COALESCE(pl.losses,0);
  IF matches < 5 THEN RETURN jsonb_build_object('ok',true,'matches',matches,'derived', '[]'::jsonb); END IF;

  win_rate := pl.wins::numeric / GREATEST(matches,1);
  gpm := COALESCE(pl.goals_scored,0)::numeric / GREATEST(matches,1);
  cpm := COALESCE(pl.goals_conceded,0)::numeric / GREATEST(matches,1);
  gd := COALESCE(pl.goals_scored,0) - COALESCE(pl.goals_conceded,0);

  candidates := ARRAY[]::text[];
  -- Goal hunter: high goals per match
  IF gpm >= 2.0 THEN candidates := array_append(candidates, 'goal_hunter'); END IF;
  -- Defensive unit: very low conceded
  IF cpm <= 0.8 AND matches >= 8 THEN candidates := array_append(candidates, 'defensive_unit'); END IF;
  -- Clutch: high win rate
  IF win_rate >= 0.7 AND matches >= 10 THEN candidates := array_append(candidates, 'clutch_player'); END IF;
  -- Veteran: many matches
  IF matches >= 50 THEN candidates := array_append(candidates, 'veteran'); END IF;
  -- Sharpshooter: gd>=20
  IF gd >= 20 THEN candidates := array_append(candidates, 'sharpshooter'); END IF;
  -- Esports player: high elo
  IF pl.player_elo >= 1400 THEN candidates := array_append(candidates, 'esports_player'); END IF;
  -- Rising star: <20 matches but win_rate>=0.65
  IF matches BETWEEN 5 AND 20 AND win_rate >= 0.65 THEN candidates := array_append(candidates, 'rising_star'); END IF;

  FOREACH candidate IN ARRAY candidates LOOP
    IF EXISTS (SELECT 1 FROM public.player_titles_catalog WHERE code = candidate) THEN
      INSERT INTO public.player_titles (player_id, title_code, awarded_by_system, is_featured)
        VALUES (_player_id, candidate, true, false)
        ON CONFLICT (player_id, title_code) DO NOTHING;
      added := array_append(added, candidate);
    END IF;
  END LOOP;

  RETURN jsonb_build_object('ok', true, 'matches', matches, 'derived', to_jsonb(added));
END;
$$;

-- Insert any missing catalog entries used above (idempotent)
INSERT INTO public.player_titles_catalog (code, label, description, category, color, rarity) VALUES
  ('goal_hunter','Goal Hunter','Averages 2+ goals per match','playstyle','#f59e0b','rare'),
  ('defensive_unit','Defensive Unit','Concedes less than 1 goal per match','playstyle','#0ea5e9','rare'),
  ('clutch_player','Clutch Player','70%+ win rate over 10+ matches','playstyle','#a855f7','epic'),
  ('veteran','Veteran','Played 50+ competitive matches','milestone','#94a3b8','uncommon'),
  ('sharpshooter','Sharpshooter','Goal difference of +20 or more','playstyle','#ef4444','rare'),
  ('esports_player','Esports Player','Player ELO 1400+','prestige','#22c55e','epic'),
  ('rising_star','Rising Star','New player with 65%+ win rate','prestige','#fde047','uncommon')
ON CONFLICT (code) DO NOTHING;

-- Trigger to refresh derived titles when a player's stats change materially
CREATE OR REPLACE FUNCTION public.refresh_playstyle_titles_trg()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.derive_player_playstyle_titles(NEW.id);
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS players_refresh_playstyles ON public.players;
CREATE TRIGGER players_refresh_playstyles
AFTER UPDATE OF wins, losses, goals_scored, goals_conceded, player_elo ON public.players
FOR EACH ROW
WHEN (OLD.wins IS DISTINCT FROM NEW.wins
   OR OLD.losses IS DISTINCT FROM NEW.losses
   OR OLD.goals_scored IS DISTINCT FROM NEW.goals_scored
   OR OLD.goals_conceded IS DISTINCT FROM NEW.goals_conceded
   OR OLD.player_elo IS DISTINCT FROM NEW.player_elo)
EXECUTE FUNCTION public.refresh_playstyle_titles_trg();


-- === 20260502153136_915b3b0a-3c02-4871-97a8-5c7245d6525b.sql ===

-- ===========================================================
-- Wave E: Clan Chat + Clan Feed
-- ===========================================================

-- Helper to check clan membership
CREATE OR REPLACE FUNCTION public.is_clan_member(_user_id uuid, _clan_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.clan_members cm
    JOIN public.players p ON p.id = cm.player_id
    WHERE cm.clan_id = _clan_id AND p.profile_id = _user_id
  ) OR EXISTS(
    SELECT 1 FROM public.clans c
    WHERE c.id = _clan_id AND (c.captain_profile_id = _user_id OR c.owner_profile_id = _user_id)
  );
$$;

-- ============ CHAT ============
CREATE TABLE IF NOT EXISTS public.clan_chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clan_id uuid NOT NULL REFERENCES public.clans(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL,
  body text,
  attachment_url text,
  reply_to_id uuid REFERENCES public.clan_chat_messages(id) ON DELETE SET NULL,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_clan_chat_clan_time ON public.clan_chat_messages(clan_id, created_at DESC);
ALTER TABLE public.clan_chat_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "chat read members" ON public.clan_chat_messages;
CREATE POLICY "chat read members" ON public.clan_chat_messages FOR SELECT
  USING (public.is_clan_member(auth.uid(), clan_id) OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "chat write members" ON public.clan_chat_messages;
CREATE POLICY "chat write members" ON public.clan_chat_messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id AND public.is_clan_member(auth.uid(), clan_id));

DROP POLICY IF EXISTS "chat update own or mod" ON public.clan_chat_messages;
CREATE POLICY "chat update own or mod" ON public.clan_chat_messages FOR UPDATE
  USING (auth.uid() = sender_id OR public.is_clan_moderator(auth.uid(), clan_id, 'chat'));

DROP POLICY IF EXISTS "chat delete own or mod" ON public.clan_chat_messages;
CREATE POLICY "chat delete own or mod" ON public.clan_chat_messages FOR DELETE
  USING (auth.uid() = sender_id OR public.is_clan_moderator(auth.uid(), clan_id, 'chat'));

CREATE TABLE IF NOT EXISTS public.clan_chat_reads (
  clan_id uuid NOT NULL REFERENCES public.clans(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  last_read_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (clan_id, user_id)
);
ALTER TABLE public.clan_chat_reads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "reads self" ON public.clan_chat_reads;
CREATE POLICY "reads self" ON public.clan_chat_reads FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============ FEED ============
CREATE TABLE IF NOT EXISTS public.clan_feed_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clan_id uuid NOT NULL REFERENCES public.clans(id) ON DELETE CASCADE,
  author_id uuid,
  kind text NOT NULL DEFAULT 'text', -- text|image|achievement|match_result|trophy|join|leave
  body text,
  media_url text,
  link_url text,
  meta jsonb DEFAULT '{}'::jsonb,
  auto_generated boolean NOT NULL DEFAULT false,
  pinned_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_clan_feed_clan_time ON public.clan_feed_posts(clan_id, created_at DESC);
ALTER TABLE public.clan_feed_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "feed public read" ON public.clan_feed_posts;
CREATE POLICY "feed public read" ON public.clan_feed_posts FOR SELECT
  USING (deleted_at IS NULL);

DROP POLICY IF EXISTS "feed members write" ON public.clan_feed_posts;
CREATE POLICY "feed members write" ON public.clan_feed_posts FOR INSERT
  WITH CHECK (
    (auto_generated = true AND public.is_admin(auth.uid()))
    OR (auth.uid() = author_id AND public.is_clan_member(auth.uid(), clan_id))
  );

DROP POLICY IF EXISTS "feed update author or mod" ON public.clan_feed_posts;
CREATE POLICY "feed update author or mod" ON public.clan_feed_posts FOR UPDATE
  USING (auth.uid() = author_id OR public.is_clan_moderator(auth.uid(), clan_id, 'feed'));

DROP POLICY IF EXISTS "feed delete author or mod" ON public.clan_feed_posts;
CREATE POLICY "feed delete author or mod" ON public.clan_feed_posts FOR DELETE
  USING (auth.uid() = author_id OR public.is_clan_moderator(auth.uid(), clan_id, 'feed'));

CREATE TABLE IF NOT EXISTS public.clan_feed_likes (
  post_id uuid NOT NULL REFERENCES public.clan_feed_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (post_id, user_id)
);
ALTER TABLE public.clan_feed_likes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "likes read all" ON public.clan_feed_likes;
CREATE POLICY "likes read all" ON public.clan_feed_likes FOR SELECT USING (true);
DROP POLICY IF EXISTS "likes self write" ON public.clan_feed_likes;
CREATE POLICY "likes self write" ON public.clan_feed_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "likes self delete" ON public.clan_feed_likes;
CREATE POLICY "likes self delete" ON public.clan_feed_likes FOR DELETE
  USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.clan_feed_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.clan_feed_posts(id) ON DELETE CASCADE,
  author_id uuid NOT NULL,
  body text NOT NULL,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_clan_feed_comments_post ON public.clan_feed_comments(post_id, created_at);
ALTER TABLE public.clan_feed_comments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "comments read" ON public.clan_feed_comments;
CREATE POLICY "comments read" ON public.clan_feed_comments FOR SELECT USING (deleted_at IS NULL);
DROP POLICY IF EXISTS "comments write" ON public.clan_feed_comments;
CREATE POLICY "comments write" ON public.clan_feed_comments FOR INSERT
  WITH CHECK (auth.uid() = author_id);
DROP POLICY IF EXISTS "comments del" ON public.clan_feed_comments;
CREATE POLICY "comments del" ON public.clan_feed_comments FOR DELETE
  USING (auth.uid() = author_id OR EXISTS(
    SELECT 1 FROM public.clan_feed_posts p WHERE p.id = post_id
      AND public.is_clan_moderator(auth.uid(), p.clan_id, 'feed')
  ));

-- ============ AUTO-POST TRIGGERS ============
CREATE OR REPLACE FUNCTION public.autopost_match_result()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  ca_name text; cb_name text; ca_tag text; cb_tag text;
  winner_name text;
BEGIN
  IF NEW.status NOT IN ('completed','walkover','disqualified') THEN RETURN NEW; END IF;
  IF (TG_OP='UPDATE' AND OLD.status = NEW.status) THEN RETURN NEW; END IF;

  SELECT name, tag INTO ca_name, ca_tag FROM public.clans WHERE id = NEW.clan_a_id;
  SELECT name, tag INTO cb_name, cb_tag FROM public.clans WHERE id = NEW.clan_b_id;
  SELECT name INTO winner_name FROM public.clans WHERE id = NEW.winner_clan_id;

  -- Post on both clans
  INSERT INTO public.clan_feed_posts (clan_id, kind, body, link_url, auto_generated, meta)
    VALUES (NEW.clan_a_id, 'match_result',
      CASE WHEN NEW.winner_clan_id = NEW.clan_a_id THEN 'ðŸ† Victory vs [' || cb_tag || '] ' || cb_name
           WHEN NEW.winner_clan_id = NEW.clan_b_id THEN 'ðŸ’” Loss vs [' || cb_tag || '] ' || cb_name
           ELSE 'Match vs [' || cb_tag || '] ' || cb_name || ' â€” ' || NEW.status END,
      '/match/' || NEW.id, true,
      jsonb_build_object('opponent_clan_id', NEW.clan_b_id, 'status', NEW.status, 'winner_clan_id', NEW.winner_clan_id));
  INSERT INTO public.clan_feed_posts (clan_id, kind, body, link_url, auto_generated, meta)
    VALUES (NEW.clan_b_id, 'match_result',
      CASE WHEN NEW.winner_clan_id = NEW.clan_b_id THEN 'ðŸ† Victory vs [' || ca_tag || '] ' || ca_name
           WHEN NEW.winner_clan_id = NEW.clan_a_id THEN 'ðŸ’” Loss vs [' || ca_tag || '] ' || ca_name
           ELSE 'Match vs [' || ca_tag || '] ' || ca_name || ' â€” ' || NEW.status END,
      '/match/' || NEW.id, true,
      jsonb_build_object('opponent_clan_id', NEW.clan_a_id, 'status', NEW.status, 'winner_clan_id', NEW.winner_clan_id));
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_autopost_match_result ON public.clan_match_rooms;
CREATE TRIGGER trg_autopost_match_result
AFTER UPDATE OF status ON public.clan_match_rooms
FOR EACH ROW EXECUTE FUNCTION public.autopost_match_result();

CREATE OR REPLACE FUNCTION public.autopost_trophy()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.clan_feed_posts (clan_id, kind, body, auto_generated, meta)
    VALUES (NEW.clan_id, 'trophy',
      'ðŸ† Earned trophy: ' || COALESCE(NEW.title, 'New trophy'),
      true, jsonb_build_object('trophy_id', NEW.id, 'placement', NEW.placement));
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_autopost_trophy ON public.clan_trophies;
CREATE TRIGGER trg_autopost_trophy
AFTER INSERT ON public.clan_trophies
FOR EACH ROW EXECUTE FUNCTION public.autopost_trophy();

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.clan_chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.clan_feed_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.clan_feed_likes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.clan_feed_comments;


-- === 20260502153802_0d261d05-8c69-466f-89a0-114358a1551c.sql ===

-- =========================================================
-- Wave F+G+H migration
-- =========================================================

-- ---- 1. Profile verification ----
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS verified boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS verified_kind text,
  ADD COLUMN IF NOT EXISTS verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS verified_by uuid;

-- Only super admins can flip verified flag; tighten existing admin update policy
DROP POLICY IF EXISTS "profiles admin update" ON public.profiles;
CREATE POLICY "profiles super admin update"
  ON public.profiles FOR UPDATE
  USING (public.has_role(auth.uid(), 'super_admin'::app_role));

-- ---- 2. Authorised post authors (poster grants) ----
CREATE TABLE IF NOT EXISTS public.verified_posters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  scope text NOT NULL DEFAULT 'news', -- 'news' | 'community_news' | 'announcements'
  community_id uuid REFERENCES public.communities(id) ON DELETE CASCADE,
  granted_by uuid,
  granted_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  UNIQUE (user_id, scope, community_id)
);
ALTER TABLE public.verified_posters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "vp super admin manage" ON public.verified_posters
  FOR ALL USING (public.has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "vp self read" ON public.verified_posters
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

CREATE OR REPLACE FUNCTION public.can_post_news(_user_id uuid, _community_id uuid DEFAULT NULL)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT public.is_admin(_user_id)
    OR public.is_news_editor(_user_id, _community_id)
    OR EXISTS (
      SELECT 1 FROM public.verified_posters
      WHERE user_id = _user_id
        AND (community_id IS NULL OR community_id = _community_id)
        AND (expires_at IS NULL OR expires_at > now())
    );
$$;

-- ---- 3. News posts upgrades ----
ALTER TABLE public.news_posts
  ADD COLUMN IF NOT EXISTS summary text,
  ADD COLUMN IF NOT EXISTS auto_summary boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS source_clan_id uuid REFERENCES public.clans(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS source_post_id uuid,
  ADD COLUMN IF NOT EXISTS community_id uuid REFERENCES public.communities(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS featured boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS published_at timestamptz;

-- Allow verified posters to insert news, not just admins
DROP POLICY IF EXISTS "news admin write" ON public.news_posts;
CREATE POLICY "news authorised write"
  ON public.news_posts FOR ALL
  USING (public.can_post_news(auth.uid(), community_id))
  WITH CHECK (public.can_post_news(auth.uid(), community_id));

-- ---- 4. Clan feed upgrades ----
ALTER TABLE public.clan_feed_posts
  ADD COLUMN IF NOT EXISTS visibility text NOT NULL DEFAULT 'public',  -- 'public'|'clan_only'|'community'
  ADD COLUMN IF NOT EXISTS requires_approval boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS approved_at timestamptz,
  ADD COLUMN IF NOT EXISTS approved_by uuid,
  ADD COLUMN IF NOT EXISTS reach_score int NOT NULL DEFAULT 0;

-- Hide unapproved posts from the public, keep visible to author + clan members + moderators
DROP POLICY IF EXISTS "feed public read" ON public.clan_feed_posts;
CREATE POLICY "feed gated read" ON public.clan_feed_posts
  FOR SELECT USING (
    deleted_at IS NULL AND (
      (visibility = 'public' AND (NOT requires_approval OR approved_at IS NOT NULL))
      OR auth.uid() = author_id
      OR public.is_clan_member(auth.uid(), clan_id)
      OR public.is_clan_moderator(auth.uid(), clan_id, NULL)
      OR public.is_admin(auth.uid())
    )
  );

-- Auto-flag big posts (media + long body) for approval
CREATE OR REPLACE FUNCTION public.flag_big_clan_post()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.requires_approval IS NULL OR NEW.requires_approval = false THEN
    IF (NEW.media_url IS NOT NULL OR length(coalesce(NEW.body,'')) > 400) THEN
      NEW.requires_approval := true;
    END IF;
  END IF;
  -- naive reach score
  NEW.reach_score := coalesce(length(coalesce(NEW.body,'')),0)
                   + (CASE WHEN NEW.media_url IS NOT NULL THEN 200 ELSE 0 END);
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS trg_flag_big_clan_post ON public.clan_feed_posts;
CREATE TRIGGER trg_flag_big_clan_post BEFORE INSERT ON public.clan_feed_posts
  FOR EACH ROW EXECUTE FUNCTION public.flag_big_clan_post();

-- ---- 5. News promotion requests ----
CREATE TABLE IF NOT EXISTS public.news_promotion_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL UNIQUE REFERENCES public.clan_feed_posts(id) ON DELETE CASCADE,
  clan_id uuid NOT NULL REFERENCES public.clans(id) ON DELETE CASCADE,
  community_id uuid REFERENCES public.communities(id) ON DELETE SET NULL,
  requested_by uuid NOT NULL,
  proposed_title text,
  proposed_summary text,
  status text NOT NULL DEFAULT 'pending', -- pending|approved|rejected|cancelled
  decided_by uuid,
  decided_at timestamptz,
  rejection_reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.news_promotion_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "promo source clan read" ON public.news_promotion_requests
  FOR SELECT USING (
    public.is_clan_member(auth.uid(), clan_id)
    OR public.is_clan_moderator(auth.uid(), clan_id, NULL)
    OR (community_id IS NOT NULL AND public.is_community_admin(auth.uid(), community_id))
    OR public.is_news_editor(auth.uid(), community_id)
    OR public.is_admin(auth.uid())
  );
CREATE POLICY "promo clan moderator insert" ON public.news_promotion_requests
  FOR INSERT WITH CHECK (
    public.is_clan_moderator(auth.uid(), clan_id, 'feed')
    OR public.is_admin(auth.uid())
  );
CREATE POLICY "promo decider update" ON public.news_promotion_requests
  FOR UPDATE USING (
    (community_id IS NOT NULL AND public.is_community_admin(auth.uid(), community_id))
    OR public.is_news_editor(auth.uid(), community_id)
    OR public.is_admin(auth.uid())
  );

-- ---- 6. Community admin inbox (shared workspace) ----
CREATE TABLE IF NOT EXISTS public.community_admin_inbox (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id uuid NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  kind text NOT NULL DEFAULT 'system',
  title text NOT NULL,
  body text,
  link text,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  resolved boolean NOT NULL DEFAULT false,
  resolved_by uuid,
  resolved_at timestamptz,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_community_inbox ON public.community_admin_inbox(community_id, resolved, created_at DESC);
ALTER TABLE public.community_admin_inbox ENABLE ROW LEVEL SECURITY;
CREATE POLICY "inbox read by community admins" ON public.community_admin_inbox
  FOR SELECT USING (public.is_community_admin(auth.uid(), community_id));
CREATE POLICY "inbox write by community admins" ON public.community_admin_inbox
  FOR ALL USING (public.is_community_admin(auth.uid(), community_id))
  WITH CHECK (public.is_community_admin(auth.uid(), community_id));
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_admin_inbox;

CREATE OR REPLACE FUNCTION public.community_inbox_post(_community_id uuid, _kind text, _title text, _body text, _link text DEFAULT NULL, _data jsonb DEFAULT '{}'::jsonb)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE new_id uuid;
BEGIN
  INSERT INTO public.community_admin_inbox(community_id, kind, title, body, link, data, created_by)
    VALUES (_community_id, COALESCE(_kind,'system'), _title, _body, _link, COALESCE(_data,'{}'::jsonb), auth.uid())
    RETURNING id INTO new_id;
  RETURN new_id;
END $$;

-- ---- 7. External integrations (per scope) ----
CREATE TABLE IF NOT EXISTS public.external_integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scope_type text NOT NULL,            -- 'community' | 'clan' | 'site'
  scope_id uuid,
  provider text NOT NULL,              -- 'twitch'|'discord_webhook'|'rawg'|'efootball'|'ical'|'youtube'
  enabled boolean NOT NULL DEFAULT true,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_ext_int_unique
  ON public.external_integrations(scope_type, COALESCE(scope_id,'00000000-0000-0000-0000-000000000000'::uuid), provider);
ALTER TABLE public.external_integrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ext read" ON public.external_integrations
  FOR SELECT USING (
    public.is_admin(auth.uid())
    OR (scope_type = 'community' AND scope_id IS NOT NULL AND public.is_community_admin(auth.uid(), scope_id))
    OR (scope_type = 'clan' AND scope_id IS NOT NULL AND public.is_clan_moderator(auth.uid(), scope_id, NULL))
  );
CREATE POLICY "ext write" ON public.external_integrations
  FOR ALL USING (
    public.is_admin(auth.uid())
    OR (scope_type = 'community' AND scope_id IS NOT NULL AND public.is_community_admin(auth.uid(), scope_id))
    OR (scope_type = 'clan' AND scope_id IS NOT NULL AND public.is_clan_moderator(auth.uid(), scope_id, NULL))
  ) WITH CHECK (
    public.is_admin(auth.uid())
    OR (scope_type = 'community' AND scope_id IS NOT NULL AND public.is_community_admin(auth.uid(), scope_id))
    OR (scope_type = 'clan' AND scope_id IS NOT NULL AND public.is_clan_moderator(auth.uid(), scope_id, NULL))
  );

-- ---- 8. Clan invite titles (large library) ----
CREATE TABLE IF NOT EXISTS public.clan_invite_titles (
  code text PRIMARY KEY,
  label text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'role', -- role|status|honor|veteran|founder|seasonal
  icon text,
  color text DEFAULT '#22d3ee',
  sort_order int NOT NULL DEFAULT 100,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.clan_invite_titles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "titles_invite read" ON public.clan_invite_titles FOR SELECT USING (true);
CREATE POLICY "titles_invite admin write" ON public.clan_invite_titles
  FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

INSERT INTO public.clan_invite_titles (code, label, description, category, icon, color, sort_order) VALUES
  ('owner','Owner','Full ownership of the clan','role','crown','#facc15',10),
  ('captain','Captain','Leads the clan day-to-day','role','star','#22d3ee',20),
  ('vice_captain','Vice Captain','Second in command','role','shield','#22d3ee',25),
  ('coach','Coach','Trains the squad','role','clipboard','#a78bfa',30),
  ('head_coach','Head Coach','Leads coaching staff','role','clipboard','#a78bfa',31),
  ('analyst','Analyst','Studies opponents and stats','role','line-chart','#60a5fa',35),
  ('media_manager','Media Manager','Runs clan socials','role','camera','#f472b6',40),
  ('content_creator','Content Creator','Streams and creates content','role','video','#f472b6',41),
  ('manager','Manager','Operations and logistics','role','briefcase','#94a3b8',45),
  ('treasurer','Treasurer','Handles clan funds','role','wallet','#22c55e',50),
  ('recruiter','Recruiter','Scouts new players','role','users','#f59e0b',55),
  ('moderator','Moderator','Keeps the chat clean','role','shield-check','#94a3b8',60),
  ('player','Player','Active competitor','role','user','#cbd5f5',65),
  ('substitute','Substitute','Sub on the bench','role','user-minus','#94a3b8',70),
  ('trial','Trialist','On a trial period','role','clock','#fbbf24',71),
  ('star_player','Star Player','Top performer','status','sparkles','#facc15',80),
  ('rising_star','Rising Star','Breakout talent','status','trending-up','#22d3ee',81),
  ('clutch_player','Clutch Player','Wins under pressure','status','flame','#f97316',82),
  ('playmaker','Playmaker','Creates the chances','status','wand','#a78bfa',83),
  ('finisher','Finisher','Lethal in front of goal','status','target','#ef4444',84),
  ('wall','The Wall','Defensive rock','status','shield','#0ea5e9',85),
  ('keeper_legend','Keeper Legend','Hero between the sticks','status','hand','#0ea5e9',86),
  ('mvp','MVP','Most Valuable Player','honor','trophy','#facc15',90),
  ('hall_of_fame','Hall of Fame','Inducted forever','honor','award','#facc15',91),
  ('legend','Legend','Long-standing icon','honor','crown','#facc15',92),
  ('goat','GOAT','Greatest of all time','honor','crown','#facc15',93),
  ('founding_member','Founding Member','Was here on day one','founder','flag','#f59e0b',100),
  ('founder','Founder','Started the clan','founder','flag','#f59e0b',101),
  ('co_founder','Co-Founder','Built it together','founder','flag','#f59e0b',102),
  ('og','OG','Original gangster','founder','flag','#f59e0b',103),
  ('day_one','Day One','From the very start','founder','flag','#f59e0b',104),
  ('veteran','Veteran','Long service member','veteran','medal','#94a3b8',110),
  ('elder','Elder','Respected veteran','veteran','medal','#94a3b8',111),
  ('returning','Returning','Welcome back','veteran','rotate-ccw','#94a3b8',112),
  ('honorary','Honorary Member','Honour granted','honor','badge','#facc15',120),
  ('partner','Partner','Affiliated brand or person','status','handshake','#22c55e',125),
  ('ambassador','Ambassador','Represents the clan','status','megaphone','#22c55e',126),
  ('sponsor','Sponsor','Financially backs the clan','status','heart','#ef4444',127),
  ('caster','Caster','Casts our matches','role','mic','#a78bfa',130),
  ('referee','Referee','Officiates matches','role','whistle','#94a3b8',131),
  ('tournament_admin','Tournament Admin','Runs tournaments','role','gavel','#a78bfa',132),
  ('community_admin','Community Admin','Runs the wider community','role','users-round','#a78bfa',133),
  ('streamer','Streamer','Broadcasts gameplay','role','tv','#f472b6',135),
  ('youtuber','YouTuber','Makes videos','role','youtube','#ef4444',136),
  ('designer','Designer','Visual assets and kits','role','palette','#a78bfa',137),
  ('editor','Editor','Edits clips and footage','role','scissors','#a78bfa',138),
  ('translator','Translator','Bridges languages','role','languages','#22c55e',139),
  ('scout','Scout','Finds new talent','role','search','#f59e0b',140),
  ('mentor','Mentor','Guides newcomers','role','graduation-cap','#22c55e',141),
  ('strategist','Strategist','Tactical brain','role','chess-knight','#a78bfa',142),
  ('captains_pick','Captain''s Pick','Hand-picked by the captain','status','star','#facc15',150),
  ('rookie','Rookie','First-season player','status','sprout','#22c55e',151),
  ('eleague_champion','E-League Champion','Won the E-League','honor','trophy','#facc15',160),
  ('cup_winner','Cup Winner','Won a cup','honor','trophy','#facc15',161),
  ('community_champion','Community Champion','Top of the community','honor','trophy','#facc15',162),
  ('seasonal_mvp','Seasonal MVP','MVP of the season','honor','trophy','#facc15',163),
  ('international','International','Played on the world stage','status','globe','#22d3ee',170),
  ('national_team','National Team','Selected for nationals','status','flag','#22d3ee',171),
  ('clan_captain_of_the_year','Captain of the Year','Top captain','honor','crown','#facc15',180),
  ('clan_player_of_the_year','Player of the Year','Top player','honor','crown','#facc15',181),
  ('clan_coach_of_the_year','Coach of the Year','Top coach','honor','clipboard','#facc15',182),
  ('honorary_captain','Honorary Captain','Captain title for life','honor','crown','#facc15',183),
  ('special_guest','Special Guest','Guest appearance','status','sparkles','#22d3ee',190),
  ('alumni','Alumni','Former member','veteran','book','#94a3b8',195),
  ('retired','Retired','Hung up the boots','veteran','armchair','#94a3b8',196)
ON CONFLICT (code) DO NOTHING;

-- ---- 9. Community admin audit ----
CREATE TABLE IF NOT EXISTS public.community_admin_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id uuid NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  actor_user_id uuid,
  action text NOT NULL,
  target_kind text,
  target_id uuid,
  reason text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.community_admin_audit ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ca_audit read" ON public.community_admin_audit
  FOR SELECT USING (public.is_community_admin(auth.uid(), community_id));
CREATE POLICY "ca_audit write" ON public.community_admin_audit
  FOR INSERT WITH CHECK (public.is_community_admin(auth.uid(), community_id));

-- ---- 10. RPCs ----

-- Naive but useful summarizer (sentence-aware, max ~220 chars)
CREATE OR REPLACE FUNCTION public.summarize_text(_t text, _max int DEFAULT 220)
RETURNS text LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE clean text; first_sent text; cut text;
BEGIN
  IF _t IS NULL OR length(_t) = 0 THEN RETURN NULL; END IF;
  clean := regexp_replace(_t, '\s+', ' ', 'g');
  IF length(clean) <= _max THEN RETURN clean; END IF;
  first_sent := substring(clean from '^(.{20,}?[\.!?])\s');
  IF first_sent IS NOT NULL AND length(first_sent) <= _max THEN
    RETURN first_sent;
  END IF;
  cut := left(clean, _max);
  cut := regexp_replace(cut, '\s+\S*$', '');
  RETURN cut || 'â€¦';
END $$;

CREATE OR REPLACE FUNCTION public.set_user_verified(_user_id uuid, _kind text, _on boolean)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'super_admin'::app_role) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Super admin only');
  END IF;
  UPDATE public.profiles
    SET verified = _on,
        verified_kind = CASE WHEN _on THEN COALESCE(_kind,'staff') ELSE NULL END,
        verified_at = CASE WHEN _on THEN now() ELSE NULL END,
        verified_by = CASE WHEN _on THEN auth.uid() ELSE NULL END
    WHERE id = _user_id;
  RETURN jsonb_build_object('ok', true);
END $$;

CREATE OR REPLACE FUNCTION public.grant_post_author(_user_id uuid, _scope text, _community_id uuid, _on boolean)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'super_admin'::app_role) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Super admin only');
  END IF;
  IF _on THEN
    INSERT INTO public.verified_posters(user_id, scope, community_id, granted_by)
      VALUES (_user_id, COALESCE(_scope,'news'), _community_id, auth.uid())
      ON CONFLICT (user_id, scope, community_id) DO NOTHING;
  ELSE
    DELETE FROM public.verified_posters
      WHERE user_id = _user_id AND scope = COALESCE(_scope,'news')
        AND COALESCE(community_id,'00000000-0000-0000-0000-000000000000'::uuid)
            = COALESCE(_community_id,'00000000-0000-0000-0000-000000000000'::uuid);
  END IF;
  RETURN jsonb_build_object('ok', true);
END $$;

CREATE OR REPLACE FUNCTION public.request_news_promotion(_post_id uuid, _proposed_title text DEFAULT NULL, _proposed_summary text DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE p public.clan_feed_posts%ROWTYPE; c public.clans%ROWTYPE; daily_count int; new_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN RETURN jsonb_build_object('ok',false,'error','Sign in required'); END IF;
  SELECT * INTO p FROM public.clan_feed_posts WHERE id = _post_id;
  IF NOT FOUND THEN RETURN jsonb_build_object('ok',false,'error','Post not found'); END IF;
  IF NOT (public.is_clan_moderator(auth.uid(), p.clan_id, 'feed') OR public.is_admin(auth.uid())) THEN
    RETURN jsonb_build_object('ok',false,'error','Only clan moderators can submit');
  END IF;
  SELECT * INTO c FROM public.clans WHERE id = p.clan_id;
  -- rate limit: 5 per clan per day
  SELECT count(*) INTO daily_count FROM public.news_promotion_requests
    WHERE clan_id = p.clan_id AND created_at > now() - interval '1 day';
  IF daily_count >= 5 THEN
    RETURN jsonb_build_object('ok',false,'error','Daily promotion limit reached');
  END IF;
  INSERT INTO public.news_promotion_requests(post_id, clan_id, community_id, requested_by, proposed_title, proposed_summary)
    VALUES (p.id, p.clan_id, c.community_id, auth.uid(),
            COALESCE(_proposed_title, left(coalesce(p.body,'Clan update'), 80)),
            COALESCE(_proposed_summary, public.summarize_text(p.body)))
    ON CONFLICT (post_id) DO UPDATE SET status='pending', proposed_title=EXCLUDED.proposed_title, proposed_summary=EXCLUDED.proposed_summary
    RETURNING id INTO new_id;
  -- ping community admins
  IF c.community_id IS NOT NULL THEN
    PERFORM public.community_inbox_post(c.community_id, 'news_promotion',
      'News promotion submitted',
      'Clan ' || c.name || ' wants to publish a feed post to news.',
      '/admin?tab=news_promotions',
      jsonb_build_object('request_id', new_id, 'clan_id', c.id, 'post_id', p.id));
  END IF;
  RETURN jsonb_build_object('ok', true, 'request_id', new_id);
END $$;

CREATE OR REPLACE FUNCTION public.decide_news_promotion(_req_id uuid, _approve boolean, _edited_summary text DEFAULT NULL, _edited_title text DEFAULT NULL, _category text DEFAULT 'clan')
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r public.news_promotion_requests%ROWTYPE; p public.clan_feed_posts%ROWTYPE; c public.clans%ROWTYPE; new_slug text; new_news uuid;
BEGIN
  IF auth.uid() IS NULL THEN RETURN jsonb_build_object('ok',false,'error','Sign in required'); END IF;
  SELECT * INTO r FROM public.news_promotion_requests WHERE id = _req_id FOR UPDATE;
  IF NOT FOUND THEN RETURN jsonb_build_object('ok',false,'error','Request not found'); END IF;
  IF r.status <> 'pending' THEN RETURN jsonb_build_object('ok',false,'error','Already decided'); END IF;
  IF NOT (public.is_admin(auth.uid())
          OR (r.community_id IS NOT NULL AND public.is_community_admin(auth.uid(), r.community_id))
          OR public.is_news_editor(auth.uid(), r.community_id)) THEN
    RETURN jsonb_build_object('ok',false,'error','Not authorized');
  END IF;
  SELECT * INTO p FROM public.clan_feed_posts WHERE id = r.post_id;
  SELECT * INTO c FROM public.clans WHERE id = r.clan_id;

  IF _approve THEN
    new_slug := lower(regexp_replace(COALESCE(_edited_title, r.proposed_title, c.name || ' update'),'[^a-zA-Z0-9]+','-','g')) || '-' || substr(gen_random_uuid()::text, 1, 6);
    INSERT INTO public.news_posts(title, slug, category, excerpt, summary, content, cover_url, published, published_at, created_by, source_clan_id, source_post_id, community_id, auto_summary)
      VALUES (
        COALESCE(_edited_title, r.proposed_title, c.name || ' update'),
        new_slug,
        COALESCE(_category,'clan'),
        COALESCE(_edited_summary, r.proposed_summary),
        COALESCE(_edited_summary, r.proposed_summary),
        p.body,
        p.media_url,
        true, now(), auth.uid(), r.clan_id, r.post_id, r.community_id,
        (_edited_summary IS NULL)
      ) RETURNING id INTO new_news;
    UPDATE public.news_promotion_requests SET status='approved', decided_by=auth.uid(), decided_at=now() WHERE id = r.id;
    -- approve underlying clan post too if it was awaiting approval
    UPDATE public.clan_feed_posts SET approved_at=now(), approved_by=auth.uid() WHERE id = p.id AND approved_at IS NULL;
    INSERT INTO public.community_admin_audit(community_id, actor_user_id, action, target_kind, target_id, reason)
      SELECT c.community_id, auth.uid(), 'promote_news_approved', 'news_post', new_news, 'Promoted clan post to news'
      WHERE c.community_id IS NOT NULL;
    RETURN jsonb_build_object('ok', true, 'news_id', new_news);
  ELSE
    UPDATE public.news_promotion_requests SET status='rejected', decided_by=auth.uid(), decided_at=now(), rejection_reason=_edited_summary WHERE id = r.id;
    INSERT INTO public.community_admin_audit(community_id, actor_user_id, action, target_kind, target_id, reason)
      SELECT c.community_id, auth.uid(), 'promote_news_rejected', 'clan_post', p.id, _edited_summary
      WHERE c.community_id IS NOT NULL;
    RETURN jsonb_build_object('ok', true, 'rejected', true);
  END IF;
END $$;

-- ---- 11. Realtime + indexes ----
ALTER PUBLICATION supabase_realtime ADD TABLE public.news_promotion_requests;
CREATE INDEX IF NOT EXISTS idx_promo_status ON public.news_promotion_requests(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_published ON public.news_posts(published, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_verified ON public.profiles(verified) WHERE verified = true;


-- === 20260502155059_5f3dd8bf-7d5a-4b87-8eb1-b212c86bc83b.sql ===
CREATE TABLE IF NOT EXISTS public.dailymotion_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dailymotion_id text NOT NULL,
  title text NOT NULL,
  description text,
  thumbnail_url text,
  duration_seconds int,
  kind text NOT NULL DEFAULT 'full_match',
  source_type text,
  source_id uuid,
  clan_id uuid REFERENCES public.clans(id) ON DELETE SET NULL,
  match_id uuid,
  clan_match_room_id uuid,
  player_id uuid REFERENCES public.players(id) ON DELETE SET NULL,
  news_post_id uuid REFERENCES public.news_posts(id) ON DELETE SET NULL,
  added_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  visibility text NOT NULL DEFAULT 'public',
  featured boolean NOT NULL DEFAULT false,
  pinned boolean NOT NULL DEFAULT false,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT dm_kind_chk CHECK (kind IN ('full_match','highlight','stream_archive','hype','interview','other')),
  CONSTRAINT dm_visibility_chk CHECK (visibility IN ('public','clan_only','unlisted'))
);

CREATE INDEX IF NOT EXISTS idx_dm_videos_clan ON public.dailymotion_videos(clan_id) WHERE clan_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_dm_videos_match ON public.dailymotion_videos(match_id) WHERE match_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_dm_videos_clan_match ON public.dailymotion_videos(clan_match_room_id) WHERE clan_match_room_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_dm_videos_player ON public.dailymotion_videos(player_id) WHERE player_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_dm_videos_news ON public.dailymotion_videos(news_post_id) WHERE news_post_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_dm_videos_featured ON public.dailymotion_videos(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_dm_videos_published ON public.dailymotion_videos(published, created_at DESC);

CREATE TRIGGER dm_videos_touch BEFORE UPDATE ON public.dailymotion_videos FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

ALTER TABLE public.dailymotion_videos ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_clan_staff(_clan_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.clans c
    WHERE c.id = _clan_id AND c.captain_profile_id = _user_id
  ) OR EXISTS (
    SELECT 1 FROM public.clan_moderators cm
    WHERE cm.clan_id = _clan_id AND cm.user_id = _user_id
  );
$$;

CREATE POLICY "dm videos public read"
ON public.dailymotion_videos FOR SELECT
USING (
  (published = true AND visibility = 'public')
  OR has_role(auth.uid(), 'super_admin'::app_role)
  OR (visibility = 'clan_only' AND clan_id IS NOT NULL AND public.is_clan_staff(clan_id, auth.uid()))
);

CREATE POLICY "dm videos staff insert"
ON public.dailymotion_videos FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR (clan_id IS NOT NULL AND public.is_clan_staff(clan_id, auth.uid()))
);

CREATE POLICY "dm videos staff update"
ON public.dailymotion_videos FOR UPDATE
USING (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR (clan_id IS NOT NULL AND public.is_clan_staff(clan_id, auth.uid()))
  OR added_by = auth.uid()
);

CREATE POLICY "dm videos staff delete"
ON public.dailymotion_videos FOR DELETE
USING (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR (clan_id IS NOT NULL AND public.is_clan_staff(clan_id, auth.uid()))
);

ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS vod_dailymotion_id text;
ALTER TABLE public.clan_match_rooms ADD COLUMN IF NOT EXISTS vod_dailymotion_id text;

INSERT INTO public.site_settings(key, value)
VALUES ('featured_stream', jsonb_build_object(
  'enabled', true,
  'twitch_login', 'nectour2025',
  'as_background', true,
  'show_overlay_label', true,
  'overlay_label', 'NECTOUR 2025 â€” LIVE'
))
ON CONFLICT (key) DO NOTHING;

-- === 20260502155903_b275a1f8-138a-4507-8a9b-5e3b577a1542.sql ===
-- 1. Tournament VOD column + dailymotion_videos.tournament_id
ALTER TABLE public.tournaments ADD COLUMN IF NOT EXISTS vod_dailymotion_id text;
ALTER TABLE public.dailymotion_videos ADD COLUMN IF NOT EXISTS tournament_id uuid REFERENCES public.tournaments(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_dm_videos_tournament ON public.dailymotion_videos(tournament_id) WHERE tournament_id IS NOT NULL;

-- 2. Public read standings (in case it wasn't set)
ALTER TABLE public.tournament_standings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "standings public read" ON public.tournament_standings;
CREATE POLICY "standings public read" ON public.tournament_standings FOR SELECT USING (true);

-- 3. Clan tournament registration RPC
CREATE OR REPLACE FUNCTION public.register_clan_for_tournament(_tournament_id uuid, _clan_id uuid, _notes text DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  t public.tournaments%ROWTYPE;
  c public.clans%ROWTYPE;
  approved_count int;
BEGIN
  IF auth.uid() IS NULL THEN RETURN jsonb_build_object('ok',false,'error','Sign in required'); END IF;
  SELECT * INTO t FROM public.tournaments WHERE id = _tournament_id;
  IF NOT FOUND THEN RETURN jsonb_build_object('ok',false,'error','Tournament not found'); END IF;
  IF t.participant_type <> 'clan' THEN RETURN jsonb_build_object('ok',false,'error','This tournament does not accept clan registrations'); END IF;
  IF t.status NOT IN ('registration_open') THEN RETURN jsonb_build_object('ok',false,'error','Registration is not open'); END IF;
  IF t.registration_closes_at IS NOT NULL AND t.registration_closes_at < now() THEN
    RETURN jsonb_build_object('ok',false,'error','Registration has closed');
  END IF;

  SELECT * INTO c FROM public.clans WHERE id = _clan_id;
  IF NOT FOUND THEN RETURN jsonb_build_object('ok',false,'error','Clan not found'); END IF;
  IF NOT (public.is_admin(auth.uid())
          OR c.captain_profile_id = auth.uid()
          OR c.owner_profile_id = auth.uid()
          OR public.is_clan_moderator(auth.uid(), _clan_id, 'manage')) THEN
    RETURN jsonb_build_object('ok',false,'error','Only clan leaders can register the clan');
  END IF;

  IF EXISTS (SELECT 1 FROM public.tournament_registrations
             WHERE tournament_id = _tournament_id AND clan_id = _clan_id
               AND status IN ('pending','approved','checked_in')) THEN
    RETURN jsonb_build_object('ok',false,'error','Clan already registered');
  END IF;

  IF t.max_participants IS NOT NULL THEN
    SELECT count(*) INTO approved_count FROM public.tournament_registrations
      WHERE tournament_id = _tournament_id AND status IN ('approved','checked_in');
    IF approved_count >= t.max_participants THEN
      RETURN jsonb_build_object('ok',false,'error','Tournament is full');
    END IF;
  END IF;

  INSERT INTO public.tournament_registrations(tournament_id, clan_id, registration_type, submitted_by, display_name, notes, status)
    VALUES (_tournament_id, _clan_id, 'clan', auth.uid(), c.name, _notes, 'pending');
  RETURN jsonb_build_object('ok', true);
END $$;

-- 4. Check-in RPC
CREATE OR REPLACE FUNCTION public.tournament_check_in(_registration_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r public.tournament_registrations%ROWTYPE;
  t public.tournaments%ROWTYPE;
  ok boolean := false;
  c public.clans%ROWTYPE;
  pl public.players%ROWTYPE;
  open_at timestamptz;
BEGIN
  IF auth.uid() IS NULL THEN RETURN jsonb_build_object('ok',false,'error','Sign in required'); END IF;
  SELECT * INTO r FROM public.tournament_registrations WHERE id = _registration_id;
  IF NOT FOUND THEN RETURN jsonb_build_object('ok',false,'error','Registration not found'); END IF;
  IF r.status NOT IN ('approved','checked_in') THEN
    RETURN jsonb_build_object('ok',false,'error','Registration must be approved first');
  END IF;
  SELECT * INTO t FROM public.tournaments WHERE id = r.tournament_id;
  IF NOT FOUND THEN RETURN jsonb_build_object('ok',false,'error','Tournament missing'); END IF;

  -- Authorize: clan leader/mod, player owner, or admin
  IF public.is_admin(auth.uid()) THEN
    ok := true;
  ELSIF r.clan_id IS NOT NULL THEN
    SELECT * INTO c FROM public.clans WHERE id = r.clan_id;
    ok := (c.captain_profile_id = auth.uid() OR c.owner_profile_id = auth.uid()
           OR public.is_clan_moderator(auth.uid(), r.clan_id, 'manage'));
  ELSIF r.player_id IS NOT NULL THEN
    SELECT * INTO pl FROM public.players WHERE id = r.player_id;
    ok := (pl.profile_id = auth.uid());
  END IF;
  IF NOT ok THEN RETURN jsonb_build_object('ok',false,'error','Not authorized'); END IF;

  -- Window: from (start_date - check_in_minutes) up to start_date
  IF t.start_date IS NOT NULL THEN
    open_at := t.start_date - (COALESCE(t.check_in_minutes, 30) || ' minutes')::interval;
    IF now() < open_at THEN
      RETURN jsonb_build_object('ok', false, 'error', 'Check-in opens at ' || open_at::text);
    END IF;
    IF now() > t.start_date + interval '30 minutes' THEN
      RETURN jsonb_build_object('ok', false, 'error', 'Check-in window has closed');
    END IF;
  END IF;

  UPDATE public.tournament_registrations
    SET checked_in = true,
        status = 'checked_in'::registration_status
    WHERE id = _registration_id;
  RETURN jsonb_build_object('ok', true);
END $$;

-- 5. Standings auto-updater for round-robin / swiss / league
CREATE OR REPLACE FUNCTION public.recalc_standings_after_match()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  pa uuid := NEW.participant_a_id;
  pb uuid := NEW.participant_b_id;
  sa int := COALESCE(NEW.score_a, 0);
  sb int := COALESCE(NEW.score_b, 0);
  pts_a int; pts_b int;
  draw_a int := 0; draw_b int := 0;
  win_a int := 0; win_b int := 0;
  loss_a int := 0; loss_b int := 0;
BEGIN
  IF NEW.status <> 'completed' THEN RETURN NEW; END IF;
  IF TG_OP = 'UPDATE' AND OLD.status = 'completed' THEN RETURN NEW; END IF;
  IF pa IS NULL OR pb IS NULL THEN RETURN NEW; END IF;

  IF NEW.winner_id IS NULL THEN
    -- draw
    pts_a := 1; pts_b := 1; draw_a := 1; draw_b := 1;
  ELSIF NEW.winner_id = pa THEN
    pts_a := 3; pts_b := 0; win_a := 1; loss_b := 1;
  ELSE
    pts_a := 0; pts_b := 3; loss_a := 1; win_b := 1;
  END IF;

  -- Upsert side A
  INSERT INTO public.tournament_standings(tournament_id, stage_id, participant_id, matches_played, wins, draws, losses, goals_for, goals_against, points)
    VALUES (NEW.tournament_id, NEW.stage_id, pa, 1, win_a, draw_a, loss_a, sa, sb, pts_a)
  ON CONFLICT (stage_id, participant_id) DO UPDATE SET
    matches_played = public.tournament_standings.matches_played + 1,
    wins = public.tournament_standings.wins + EXCLUDED.wins,
    draws = public.tournament_standings.draws + EXCLUDED.draws,
    losses = public.tournament_standings.losses + EXCLUDED.losses,
    goals_for = public.tournament_standings.goals_for + EXCLUDED.goals_for,
    goals_against = public.tournament_standings.goals_against + EXCLUDED.goals_against,
    points = public.tournament_standings.points + EXCLUDED.points;

  -- Upsert side B
  INSERT INTO public.tournament_standings(tournament_id, stage_id, participant_id, matches_played, wins, draws, losses, goals_for, goals_against, points)
    VALUES (NEW.tournament_id, NEW.stage_id, pb, 1, win_b, draw_b, loss_b, sb, sa, pts_b)
  ON CONFLICT (stage_id, participant_id) DO UPDATE SET
    matches_played = public.tournament_standings.matches_played + 1,
    wins = public.tournament_standings.wins + EXCLUDED.wins,
    draws = public.tournament_standings.draws + EXCLUDED.draws,
    losses = public.tournament_standings.losses + EXCLUDED.losses,
    goals_for = public.tournament_standings.goals_for + EXCLUDED.goals_for,
    goals_against = public.tournament_standings.goals_against + EXCLUDED.goals_against,
    points = public.tournament_standings.points + EXCLUDED.points;

  RETURN NEW;
END $$;

-- Need a unique constraint for ON CONFLICT to work
ALTER TABLE public.tournament_standings DROP CONSTRAINT IF EXISTS tournament_standings_stage_participant_unique;
ALTER TABLE public.tournament_standings ADD CONSTRAINT tournament_standings_stage_participant_unique UNIQUE (stage_id, participant_id);

DROP TRIGGER IF EXISTS trg_recalc_standings ON public.bracket_matches;
CREATE TRIGGER trg_recalc_standings
AFTER INSERT OR UPDATE OF status ON public.bracket_matches
FOR EACH ROW EXECUTE FUNCTION public.recalc_standings_after_match();


-- === 20260502163042_0b98ab9f-a1d5-42d2-ac4a-4328a7179b44.sql ===
-- Subscriptions (Stripe-managed)
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  stripe_subscription_id text not null unique,
  stripe_customer_id text not null,
  product_id text not null,
  price_id text not null,
  status text not null default 'active',
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean default false,
  environment text not null default 'sandbox',
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists idx_subscriptions_user_id on public.subscriptions(user_id);
create index if not exists idx_subscriptions_stripe_id on public.subscriptions(stripe_subscription_id);
alter table public.subscriptions enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='subscriptions' and policyname='Users view own subscription') then
    create policy "Users view own subscription" on public.subscriptions for select using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where tablename='subscriptions' and policyname='Service role manages subscriptions') then
    create policy "Service role manages subscriptions" on public.subscriptions for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
  end if;
end $$;

create or replace function public.has_active_subscription(user_uuid uuid, check_env text default 'sandbox')
returns boolean language sql security definer set search_path = public as $$
  select exists (
    select 1 from public.subscriptions
    where user_id = user_uuid
    and environment = check_env
    and (
      (status in ('active','trialing') and (current_period_end is null or current_period_end > now()))
      or (status = 'canceled' and current_period_end > now())
    )
  );
$$;

-- One-time purchases / payments log
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  stripe_session_id text unique,
  stripe_payment_intent_id text,
  price_id text,
  product_id text,
  purpose text, -- 'tournament_entry' | 'eleague_entry' | 'homepage_sponsorship' | 'tournament_sponsor_slot' | 'shop'
  ref_type text, -- e.g. 'tournament', 'sponsor_slot'
  ref_id uuid,
  amount_cents integer,
  currency text,
  status text default 'pending',
  environment text not null default 'sandbox',
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);
alter table public.payments enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='payments' and policyname='Users view own payments') then
    create policy "Users view own payments" on public.payments for select using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where tablename='payments' and policyname='Service role manages payments') then
    create policy "Service role manages payments" on public.payments for all using (auth.role()='service_role') with check (auth.role()='service_role');
  end if;
end $$;

-- Tournament host monetization approval
create table if not exists public.tournament_paid_approvals (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null,
  approved_by uuid references auth.users(id),
  entry_fee_cents integer not null default 0,
  platform_fee_pct numeric not null default 10.0,
  approved boolean not null default false,
  created_at timestamptz default now(),
  unique(tournament_id)
);
alter table public.tournament_paid_approvals enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='tournament_paid_approvals' and policyname='Public read paid approvals') then
    create policy "Public read paid approvals" on public.tournament_paid_approvals for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename='tournament_paid_approvals' and policyname='Super admins manage paid approvals') then
    create policy "Super admins manage paid approvals" on public.tournament_paid_approvals for all
      using (public.has_role(auth.uid(),'super_admin'))
      with check (public.has_role(auth.uid(),'super_admin'));
  end if;
end $$;

-- Homepage / tournament sponsor slots (purchased via Stripe)
create table if not exists public.sponsor_slots (
  id uuid primary key default gen_random_uuid(),
  slot_type text not null, -- 'homepage' | 'tournament'
  tournament_id uuid,
  buyer_user_id uuid references auth.users(id) on delete set null,
  organization_name text not null,
  link_url text,
  logo_url text,
  starts_at timestamptz not null default now(),
  ends_at timestamptz not null,
  active boolean not null default true,
  payment_id uuid references public.payments(id) on delete set null,
  created_at timestamptz default now()
);
alter table public.sponsor_slots enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='sponsor_slots' and policyname='Public read active slots') then
    create policy "Public read active slots" on public.sponsor_slots for select using (active = true and ends_at > now());
  end if;
  if not exists (select 1 from pg_policies where tablename='sponsor_slots' and policyname='Super admins manage slots') then
    create policy "Super admins manage slots" on public.sponsor_slots for all
      using (public.has_role(auth.uid(),'super_admin'))
      with check (public.has_role(auth.uid(),'super_admin'));
  end if;
end $$;

-- Site setting: shop enabled (off by default)
insert into public.site_settings (key, value)
values ('shop', '{"enabled": false}'::jsonb)
on conflict (key) do nothing;


-- === 20260502164131_b2bc8806-8d37-410c-ad9c-cc53df18c0a7.sql ===

-- 1. Notify on bracket advancement
CREATE OR REPLACE FUNCTION public.notify_bracket_advance()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  t_title text; winner_users uuid[]; loser_users uuid[]; uid uuid;
  next_match record;
BEGIN
  IF NEW.winner_id IS NULL OR (TG_OP='UPDATE' AND OLD.winner_id IS NOT DISTINCT FROM NEW.winner_id) THEN
    RETURN NEW;
  END IF;
  SELECT title INTO t_title FROM tournaments WHERE id = NEW.tournament_id;

  -- collect winner/loser user ids (clan members or solo player)
  SELECT array_agg(DISTINCT cm.user_id) INTO winner_users
    FROM tournament_registrations tr
    LEFT JOIN clan_members cm ON cm.clan_id = tr.clan_id
    WHERE tr.id = NEW.winner_id;
  IF winner_users IS NULL THEN
    SELECT array_agg(DISTINCT tr.player_id) INTO winner_users
      FROM tournament_registrations tr WHERE tr.id = NEW.winner_id AND tr.player_id IS NOT NULL;
  END IF;

  SELECT array_agg(DISTINCT cm.user_id) INTO loser_users
    FROM tournament_registrations tr
    LEFT JOIN clan_members cm ON cm.clan_id = tr.clan_id
    WHERE tr.id = CASE WHEN NEW.winner_id = NEW.participant_a_id THEN NEW.participant_b_id ELSE NEW.participant_a_id END;

  IF winner_users IS NOT NULL THEN
    FOREACH uid IN ARRAY winner_users LOOP
      IF uid IS NOT NULL THEN
        INSERT INTO notifications(user_id, type, title, body, link, data)
        VALUES (uid, 'tournament', 'You advanced! ðŸ†', 'Won round ' || NEW.round || ' in ' || COALESCE(t_title,'tournament'), '/tournaments/' || NEW.tournament_id, jsonb_build_object('match_id', NEW.id));
      END IF;
    END LOOP;
  END IF;
  IF loser_users IS NOT NULL THEN
    FOREACH uid IN ARRAY loser_users LOOP
      IF uid IS NOT NULL THEN
        INSERT INTO notifications(user_id, type, title, body, link, data)
        VALUES (uid, 'tournament', 'Match result', 'Your run in ' || COALESCE(t_title,'the tournament') || ' has ended at round ' || NEW.round || '. GG!', '/tournaments/' || NEW.tournament_id, jsonb_build_object('match_id', NEW.id));
      END IF;
    END LOOP;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_notify_bracket_advance ON public.bracket_matches;
CREATE TRIGGER trg_notify_bracket_advance
AFTER UPDATE ON public.bracket_matches
FOR EACH ROW EXECUTE FUNCTION public.notify_bracket_advance();

-- 2. Notify on registration status change
CREATE OR REPLACE FUNCTION public.notify_registration_status()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  t_title text; recipients uuid[]; uid uuid; verb text;
BEGIN
  IF TG_OP='UPDATE' AND OLD.status = NEW.status THEN RETURN NEW; END IF;
  IF NEW.status NOT IN ('approved','rejected') THEN RETURN NEW; END IF;
  SELECT title INTO t_title FROM tournaments WHERE id = NEW.tournament_id;
  IF NEW.player_id IS NOT NULL THEN
    recipients := ARRAY[NEW.player_id];
  ELSIF NEW.clan_id IS NOT NULL THEN
    SELECT array_agg(DISTINCT user_id) INTO recipients FROM clan_members WHERE clan_id = NEW.clan_id;
  END IF;
  verb := CASE WHEN NEW.status='approved' THEN 'approved âœ…' ELSE 'rejected' END;
  IF recipients IS NOT NULL THEN
    FOREACH uid IN ARRAY recipients LOOP
      IF uid IS NOT NULL THEN
        INSERT INTO notifications(user_id, type, title, body, link)
        VALUES (uid, 'tournament', 'Registration ' || verb, 'Your registration for ' || COALESCE(t_title,'a tournament') || ' was ' || verb || '.', '/tournaments/' || NEW.tournament_id);
      END IF;
    END LOOP;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_notify_registration_status ON public.tournament_registrations;
CREATE TRIGGER trg_notify_registration_status
AFTER INSERT OR UPDATE OF status ON public.tournament_registrations
FOR EACH ROW EXECUTE FUNCTION public.notify_registration_status();

-- 3. Auto status transitions (called via cron-able function)
CREATE OR REPLACE FUNCTION public.auto_transition_tournament_status()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  -- published â†’ live when start date reached
  UPDATE tournaments SET status='live'
  WHERE status='published' AND start_date IS NOT NULL AND start_date <= now();

  -- live â†’ completed when no pending bracket matches remain (and there were some)
  UPDATE tournaments t SET status='completed'
  WHERE t.status='live'
    AND EXISTS (SELECT 1 FROM bracket_matches bm WHERE bm.tournament_id = t.id)
    AND NOT EXISTS (SELECT 1 FROM bracket_matches bm WHERE bm.tournament_id = t.id AND bm.winner_id IS NULL);
END $$;


-- === 20260502164515_f18a5da2-d719-45fa-9a52-9a8abe181304.sql ===

INSERT INTO storage.buckets (id, name, public) VALUES ('site-assets', 'site-assets', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "site-assets public read" ON storage.objects;
CREATE POLICY "site-assets public read" ON storage.objects FOR SELECT USING (bucket_id = 'site-assets');

DROP POLICY IF EXISTS "site-assets admin write" ON storage.objects;
CREATE POLICY "site-assets admin write" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'site-assets' AND (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'tournament_admin'::app_role)));

DROP POLICY IF EXISTS "site-assets admin update" ON storage.objects;
CREATE POLICY "site-assets admin update" ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'site-assets' AND (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'tournament_admin'::app_role)));

DROP POLICY IF EXISTS "site-assets admin delete" ON storage.objects;
CREATE POLICY "site-assets admin delete" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'site-assets' AND (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'tournament_admin'::app_role)));


-- === 20260502165218_231c9b04-2bd6-4065-9015-6a325de4bfca.sql ===

-- Tournament Series (top-level brands, e.g. KAF E-League, Tournex)
CREATE TABLE IF NOT EXISTS public.tournament_series (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  tagline text,
  description text,
  logo_url text,
  banner_url text,
  poster_url text,
  is_official boolean NOT NULL DEFAULT false,
  pinned boolean NOT NULL DEFAULT false,
  accent_color text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.tournament_series ENABLE ROW LEVEL SECURITY;

CREATE POLICY "series public read" ON public.tournament_series FOR SELECT USING (true);
CREATE POLICY "series admin write" ON public.tournament_series
  USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

-- Per-series admin grants
CREATE TABLE IF NOT EXISTS public.series_admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  series_id uuid NOT NULL REFERENCES public.tournament_series(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  permissions text[] NOT NULL DEFAULT ARRAY['edit','create','manage_admins'],
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  UNIQUE(series_id, user_id)
);

ALTER TABLE public.series_admins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "series_admins read self or admin" ON public.series_admins FOR SELECT
  USING (auth.uid() = user_id OR is_admin(auth.uid()));
CREATE POLICY "series_admins admin write" ON public.series_admins
  USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

-- Helper: is a user an admin of a given series?
CREATE OR REPLACE FUNCTION public.is_series_admin(_user_id uuid, _series_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.series_admins
    WHERE user_id = _user_id AND series_id = _series_id
      AND (expires_at IS NULL OR expires_at > now())
  ) OR public.is_admin(_user_id);
$$;

-- Link tournaments to a series via FK (in addition to existing series_key text)
ALTER TABLE public.tournaments ADD COLUMN IF NOT EXISTS series_id uuid REFERENCES public.tournament_series(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_tournaments_series_id ON public.tournaments(series_id);

-- Allow series admins to update/insert tournaments in their series
CREATE POLICY "tournaments series admin update" ON public.tournaments FOR UPDATE
  USING (series_id IS NOT NULL AND public.is_series_admin(auth.uid(), series_id))
  WITH CHECK (series_id IS NOT NULL AND public.is_series_admin(auth.uid(), series_id));

CREATE POLICY "tournaments series admin insert" ON public.tournaments FOR INSERT
  TO authenticated
  WITH CHECK (series_id IS NOT NULL AND public.is_series_admin(auth.uid(), series_id));

-- Seed the two original KAFConnect series, pinned + official
INSERT INTO public.tournament_series (slug, name, tagline, description, is_official, pinned, accent_color)
VALUES
  ('kaf-eleague', 'KAF E-League',
   'Konami Afrique Francophone â€” Season 1',
   'The flagship 5-phase pipeline transforming open competition into a streamed, professional 3v3 esports league across French-speaking Africa.',
   true, true, '#16a34a'),
  ('tournex', 'Tournex',
   'KAFConnect Originals â€” competitive tournament circuit',
   'Tournex is the open-circuit tournament series powered by KAFConnect â€” fast-paced events, multiple games, year-round.',
   true, true, '#06b6d4')
ON CONFLICT (slug) DO NOTHING;


-- === 20260502165932_baec0608-53ff-4ddf-ae6e-d076b3084bed.sql ===

CREATE TABLE IF NOT EXISTS public.badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  icon text,
  color text DEFAULT '#22d3ee',
  rarity text NOT NULL DEFAULT 'common',
  category text NOT NULL DEFAULT 'general',
  auto_rule jsonb,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "badges public read" ON public.badges FOR SELECT USING (true);
CREATE POLICY "badges admin write" ON public.badges
  USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

CREATE TABLE IF NOT EXISTS public.user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  badge_id uuid NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  awarded_by uuid,
  awarded_at timestamptz NOT NULL DEFAULT now(),
  note text,
  UNIQUE (user_id, badge_id)
);

ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_badges public read" ON public.user_badges FOR SELECT USING (true);
CREATE POLICY "user_badges admin write" ON public.user_badges
  USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

CREATE INDEX IF NOT EXISTS idx_user_badges_user ON public.user_badges(user_id);

INSERT INTO public.badges (slug, name, description, icon, color, rarity, category) VALUES
  ('founder', 'Founder', 'Joined KAFConnect during the launch season.', 'Crown', '#fbbf24', 'legendary', 'community'),
  ('verified-player', 'Verified Player', 'Identity verified by KAFConnect staff.', 'BadgeCheck', '#22d3ee', 'rare', 'identity'),
  ('champion', 'Champion', 'Won a KAFConnect tournament.', 'Trophy', '#fbbf24', 'epic', 'achievement'),
  ('top-scorer', 'Top Scorer', 'Top scorer of a tournament season.', 'Target', '#ef4444', 'rare', 'achievement'),
  ('kaf-eleague-drafted', 'KAF E-League Drafted', 'Drafted into the KAF E-League.', 'Star', '#16a34a', 'epic', 'series'),
  ('tournex-champion', 'Tournex Champion', 'Won a Tournex tournament.', 'Trophy', '#06b6d4', 'epic', 'series'),
  ('beta-tester', 'Beta Tester', 'Tested KAFConnect during the beta.', 'Sparkles', '#a855f7', 'rare', 'community'),
  ('streamer', 'Partnered Streamer', 'Officially partnered KAFConnect streamer.', 'Radio', '#8b5cf6', 'rare', 'community')
ON CONFLICT (slug) DO NOTHING;


-- === 20260502170848_34537996-fd7a-45cd-b697-edbb07de5f7b.sql ===

-- Sponsor scheduling and homepage flag
ALTER TABLE public.sponsors
  ADD COLUMN IF NOT EXISTS start_at timestamptz,
  ADD COLUMN IF NOT EXISTS end_at timestamptz,
  ADD COLUMN IF NOT EXISTS show_on_homepage boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 100,
  ADD COLUMN IF NOT EXISTS video_url text;

CREATE INDEX IF NOT EXISTS idx_sponsors_homepage ON public.sponsors (show_on_homepage, active, sort_order);

-- Role permissions matrix (SuperAdmin-managed feature flags per role)
CREATE TABLE IF NOT EXISTS public.role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role public.app_role NOT NULL,
  permission_key text NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid,
  UNIQUE (role, permission_key)
);

ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "role_permissions read all" ON public.role_permissions;
CREATE POLICY "role_permissions read all" ON public.role_permissions
  FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "role_permissions super admin write" ON public.role_permissions;
CREATE POLICY "role_permissions super admin write" ON public.role_permissions
  FOR ALL USING (public.has_role(auth.uid(), 'super_admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));

-- Helper: check if a permission key is enabled for any of the user's roles
CREATE OR REPLACE FUNCTION public.role_permission_enabled(_user_id uuid, _key text)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    LEFT JOIN public.role_permissions rp
      ON rp.role = ur.role AND rp.permission_key = _key
    WHERE ur.user_id = _user_id
      AND COALESCE(rp.enabled, true)
  );
$$;

-- Seed default permission keys for the matrix UI (idempotent)
INSERT INTO public.role_permissions (role, permission_key, enabled)
SELECT r.role, k.key, k.def
FROM (VALUES
  ('super_admin'::public.app_role),
  ('tournament_admin'::public.app_role),
  ('user'::public.app_role)
) AS r(role)
CROSS JOIN (VALUES
  ('news.publish', true),
  ('news.edit_others', false),
  ('tournaments.create', true),
  ('tournaments.delete', false),
  ('clans.create', true),
  ('sponsors.manage', false),
  ('users.manage_roles', false),
  ('site.design', false),
  ('reports.handle', false)
) AS k(key, def)
ON CONFLICT (role, permission_key) DO NOTHING;

-- Defaults: super_admin gets everything
UPDATE public.role_permissions SET enabled = true WHERE role = 'super_admin';


-- === 20260502172255_47407328-5af6-491a-bd63-61f3321fd9e8.sql ===
CREATE OR REPLACE VIEW public.user_permission_keys AS
SELECT DISTINCT ur.user_id, rp.permission_key
FROM public.user_roles ur
JOIN public.role_permissions rp ON rp.role = ur.role AND rp.enabled = true;

CREATE TABLE IF NOT EXISTS public.notification_prefs (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email_news boolean NOT NULL DEFAULT true,
  email_tournament boolean NOT NULL DEFAULT true,
  email_match boolean NOT NULL DEFAULT true,
  email_clan boolean NOT NULL DEFAULT true,
  inapp_news boolean NOT NULL DEFAULT true,
  inapp_tournament boolean NOT NULL DEFAULT true,
  inapp_match boolean NOT NULL DEFAULT true,
  inapp_clan boolean NOT NULL DEFAULT true,
  digest_frequency text NOT NULL DEFAULT 'instant',
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.notification_prefs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "user reads own prefs" ON public.notification_prefs;
CREATE POLICY "user reads own prefs" ON public.notification_prefs FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "user upserts own prefs" ON public.notification_prefs;
CREATE POLICY "user upserts own prefs" ON public.notification_prefs FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "user updates own prefs" ON public.notification_prefs;
CREATE POLICY "user updates own prefs" ON public.notification_prefs FOR UPDATE USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.clan_scouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clan_id uuid NOT NULL REFERENCES public.clans(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  assigned_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (clan_id, user_id)
);
ALTER TABLE public.clan_scouts ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_clan_owner(_user_id uuid, _clan_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.clans c
    WHERE c.id = _clan_id AND c.owner_profile_id = _user_id
  );
$$;

DROP POLICY IF EXISTS "scout self read" ON public.clan_scouts;
CREATE POLICY "scout self read" ON public.clan_scouts FOR SELECT USING (
  auth.uid() = user_id
  OR public.has_role(auth.uid(), 'super_admin')
  OR public.is_clan_owner(auth.uid(), clan_id)
);
DROP POLICY IF EXISTS "clan owner manages scouts" ON public.clan_scouts;
CREATE POLICY "clan owner manages scouts" ON public.clan_scouts FOR ALL USING (
  public.has_role(auth.uid(), 'super_admin') OR public.is_clan_owner(auth.uid(), clan_id)
) WITH CHECK (
  public.has_role(auth.uid(), 'super_admin') OR public.is_clan_owner(auth.uid(), clan_id)
);

CREATE OR REPLACE FUNCTION public.sponsors_expiring_soon()
RETURNS TABLE(id uuid, name text, end_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT id, name, end_at FROM public.sponsors
  WHERE end_at IS NOT NULL
    AND end_at > now()
    AND end_at < now() + interval '7 days';
$$;

-- === 20260502172315_94958e2f-e0aa-420f-b100-098bdfe668b8.sql ===
DROP VIEW IF EXISTS public.user_permission_keys;
CREATE VIEW public.user_permission_keys
WITH (security_invoker = true) AS
SELECT DISTINCT ur.user_id, rp.permission_key
FROM public.user_roles ur
JOIN public.role_permissions rp ON rp.role = ur.role AND rp.enabled = true;

-- === 20260502190108_be151991-17e5-464a-b034-620699dfddff.sql ===

-- =========================================================
-- CLAN GUARDS
-- =========================================================

create or replace function public.can_invite_to_clan(_clan_id uuid, _user_id uuid)
returns boolean language sql stable security definer set search_path=public as $$
  select
    exists(select 1 from clans c
            where c.id = _clan_id
              and c.disbanded_at is null
              and (c.owner_profile_id = _user_id or c.captain_profile_id = _user_id))
    or exists(select 1 from clan_moderators m
               where m.clan_id = _clan_id and m.user_id = _user_id
                 and 'recruit' = ANY(m.scopes))
    or public.is_admin(_user_id);
$$;

create or replace function public.can_kick_clan_member(_clan_id uuid, _target_user uuid, _actor uuid)
returns boolean language sql stable security definer set search_path=public as $$
  select case
    when public.is_admin(_actor) then true
    -- never kick the owner
    when exists(select 1 from clans where id=_clan_id and owner_profile_id=_target_user) then false
    -- owner can kick anyone
    when exists(select 1 from clans where id=_clan_id and owner_profile_id=_actor) then true
    -- captain can kick non-owner members
    when exists(select 1 from clans where id=_clan_id and captain_profile_id=_actor) then true
    else false
  end;
$$;

-- 24h cooldown: blocks re-inviting the same gamertag to the same clan within 24h
create or replace function public.clan_invite_cooldown_check()
returns trigger language plpgsql security definer set search_path=public as $$
declare _recent int;
begin
  if exists(select 1 from clans where id=NEW.clan_id and disbanded_at is not null) then
    raise exception 'CLAN_DISBANDED: cannot invite to a disbanded clan';
  end if;
  if not public.can_invite_to_clan(NEW.clan_id, auth.uid()) then
    raise exception 'NOT_AUTHORIZED: only owner, captain or recruit-mods can invite';
  end if;
  select count(*) into _recent
    from clan_invites
   where clan_id = NEW.clan_id
     and lower(coalesce(invitee_gamertag,'')) = lower(coalesce(NEW.invitee_gamertag,''))
     and created_at > now() - interval '24 hours';
  if _recent > 0 then
    raise exception 'INVITE_COOLDOWN: this gamertag was already invited in the last 24h';
  end if;
  return NEW;
end;
$$;

drop trigger if exists trg_clan_invite_cooldown on public.clan_invites;
create trigger trg_clan_invite_cooldown
  before insert on public.clan_invites
  for each row execute function public.clan_invite_cooldown_check();

-- Max 5 pending join requests per user
create or replace function public.clan_join_request_guard()
returns trigger language plpgsql security definer set search_path=public as $$
declare _open int;
begin
  if exists(select 1 from clans where id=NEW.clan_id and disbanded_at is not null) then
    raise exception 'CLAN_DISBANDED: cannot request to join a disbanded clan';
  end if;
  select count(*) into _open
    from clan_join_requests
   where user_id = NEW.user_id
     and status = 'pending';
  if _open >= 5 then
    raise exception 'TOO_MANY_REQUESTS: you already have 5 pending clan join requests';
  end if;
  return NEW;
end;
$$;

drop trigger if exists trg_clan_join_req_guard on public.clan_join_requests;
create trigger trg_clan_join_req_guard
  before insert on public.clan_join_requests
  for each row execute function public.clan_join_request_guard();

-- Block roster > 30 and protect owner field
create or replace function public.clan_member_size_guard()
returns trigger language plpgsql security definer set search_path=public as $$
declare _count int;
begin
  select count(*) into _count from clan_members where clan_id = NEW.clan_id;
  if _count >= 30 then
    raise exception 'CLAN_FULL: maximum 30 active members per clan';
  end if;
  return NEW;
end;
$$;

drop trigger if exists trg_clan_member_size on public.clan_members;
create trigger trg_clan_member_size
  before insert on public.clan_members
  for each row execute function public.clan_member_size_guard();

create or replace function public.clan_owner_protect()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  if NEW.owner_profile_id is distinct from OLD.owner_profile_id then
    if not (auth.uid() = OLD.owner_profile_id or public.is_admin(auth.uid())) then
      raise exception 'OWNER_LOCKED: only current owner or admin can transfer ownership';
    end if;
  end if;
  -- auto-close recruitment on disband / merge
  if (NEW.disbanded_at is not null and OLD.disbanded_at is null)
     or (NEW.merged_into_clan_id is not null and OLD.merged_into_clan_id is null) then
    NEW.recruitment_status := 'closed';
  end if;
  return NEW;
end;
$$;

drop trigger if exists trg_clan_owner_protect on public.clans;
create trigger trg_clan_owner_protect
  before update on public.clans
  for each row execute function public.clan_owner_protect();

-- =========================================================
-- TOURNAMENT GUARDS
-- =========================================================

-- Helper: who can moderate a tournament
create or replace function public.is_tournament_mod(_t_id uuid, _user uuid)
returns boolean language sql stable security definer set search_path=public as $$
  select public.is_admin(_user)
      or exists(select 1 from tournaments t where t.id=_t_id and t.created_by=_user)
      or exists(select 1 from tournament_staff s where s.tournament_id=_t_id and s.user_id=_user);
$$;

-- Locks critical fields once a tournament has started
create or replace function public.tournament_change_guard()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  -- once live/completed, only mods can touch core fields
  if OLD.status in ('live','completed') then
    if (NEW.format is distinct from OLD.format)
       or (NEW.start_date is distinct from OLD.start_date)
       or (NEW.prize_pool is distinct from OLD.prize_pool) then
      if not public.is_tournament_mod(OLD.id, auth.uid()) then
        raise exception 'TOURNAMENT_LOCKED: cannot change core settings after start without staff role';
      end if;
    end if;
  end if;

  -- only super admin, organizer or admin can flip 'is_kaf_official' / 'pinned'
  if (NEW.is_kaf_official is distinct from OLD.is_kaf_official)
     or (NEW.pinned is distinct from OLD.pinned)
     or (NEW.featured is distinct from OLD.featured) then
    if not (public.is_admin(auth.uid()) or auth.uid()=OLD.created_by) then
      raise exception 'NOT_AUTHORIZED: only admin or organizer can change official/pinned/featured flags';
    end if;
  end if;

  return NEW;
end;
$$;

drop trigger if exists trg_tournament_change_guard on public.tournaments;
create trigger trg_tournament_change_guard
  before update on public.tournaments
  for each row execute function public.tournament_change_guard();

-- Block registrations after the close window
create or replace function public.tournament_registration_window_guard()
returns trigger language plpgsql security definer set search_path=public as $$
declare _t public.tournaments%rowtype;
begin
  select * into _t from public.tournaments where id = NEW.tournament_id;
  if _t is null then return NEW; end if;
  if _t.status in ('completed','cancelled') then
    raise exception 'CLOSED: tournament no longer accepts registrations';
  end if;
  if _t.registration_closes_at is not null and now() > _t.registration_closes_at then
    raise exception 'REGISTRATION_CLOSED: deadline has passed';
  end if;
  if _t.registration_opens_at is not null and now() < _t.registration_opens_at then
    raise exception 'REGISTRATION_NOT_OPEN: registrations open later';
  end if;
  -- enforce max participants
  if _t.max_participants is not null then
    if (select count(*) from public.tournament_registrations where tournament_id = NEW.tournament_id) >= _t.max_participants then
      raise exception 'FULL: tournament is at capacity';
    end if;
  end if;
  return NEW;
end;
$$;

drop trigger if exists trg_tournament_reg_window on public.tournament_registrations;
create trigger trg_tournament_reg_window
  before insert on public.tournament_registrations
  for each row execute function public.tournament_registration_window_guard();

-- Prevent staff role escalation to head_admin without admin/organizer
create or replace function public.tournament_staff_escalation_guard()
returns trigger language plpgsql security definer set search_path=public as $$
declare _organizer uuid;
begin
  select created_by into _organizer from public.tournaments where id = NEW.tournament_id;
  if NEW.role = 'head_admin' then
    if not (public.is_admin(auth.uid()) or auth.uid()=_organizer) then
      raise exception 'NOT_AUTHORIZED: only organizer or super-admin can grant head_admin';
    end if;
  end if;
  return NEW;
end;
$$;

drop trigger if exists trg_tournament_staff_escalation on public.tournament_staff;
create trigger trg_tournament_staff_escalation
  before insert or update on public.tournament_staff
  for each row execute function public.tournament_staff_escalation_guard();


-- === 20260502193456_93c8321d-e7b5-42e2-875c-bc4207e70d84.sql ===
-- Extend clan_member_role enum (FM-style staff)
DO $$ BEGIN
  ALTER TYPE clan_member_role ADD VALUE IF NOT EXISTS 'assistant_manager';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TYPE clan_member_role ADD VALUE IF NOT EXISTS 'vice_captain';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TYPE clan_member_role ADD VALUE IF NOT EXISTS 'loanee';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Per-clan permission matrix (overrides defaults)
CREATE TABLE IF NOT EXISTS public.clan_role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clan_id uuid NOT NULL REFERENCES public.clans(id) ON DELETE CASCADE,
  role text NOT NULL,
  permission_key text NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (clan_id, role, permission_key)
);

ALTER TABLE public.clan_role_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "clan_role_perms public read" ON public.clan_role_permissions
  FOR SELECT USING (true);

CREATE POLICY "clan_role_perms owner write" ON public.clan_role_permissions
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.clans c
    WHERE c.id = clan_role_permissions.clan_id
      AND (c.captain_profile_id = auth.uid() OR c.owner_profile_id = auth.uid() OR is_admin(auth.uid()))
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.clans c
    WHERE c.id = clan_role_permissions.clan_id
      AND (c.captain_profile_id = auth.uid() OR c.owner_profile_id = auth.uid() OR is_admin(auth.uid()))
  ));

-- Default role -> permissions map (security definer helper)
CREATE OR REPLACE FUNCTION public.clan_default_role_perm(_role text, _action text)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT CASE
    -- OWNER & CAPTAIN: everything
    WHEN _role IN ('owner','captain','leader') THEN true
    -- MANAGER / CO_CAPTAIN: most things except disband / transfer ownership
    WHEN _role IN ('manager','co_captain','vice_captain') THEN
      _action IN ('invite','kick','sign','post_news','edit_tactics','accept_scrim','manage_calendar','manage_trials','manage_roster','chat_announce','manage_moderators','accept_join')
    WHEN _role IN ('assistant_manager') THEN
      _action IN ('invite','sign','post_news','edit_tactics','accept_scrim','manage_calendar','manage_trials','chat_announce','accept_join')
    WHEN _role IN ('coach','officer_coach') THEN
      _action IN ('edit_tactics','manage_calendar','post_news','chat_announce','manage_trials')
    WHEN _role IN ('analyst','officer_analyst') THEN
      _action IN ('edit_tactics','post_news')
    WHEN _role IN ('officer_recruiter') THEN
      _action IN ('invite','sign','manage_trials','accept_join','post_news')
    WHEN _role IN ('moderator','media_admin') THEN
      _action IN ('post_news','chat_announce','manage_calendar')
    WHEN _role IN ('player','sub','substitute','academy','trial','loanee') THEN
      _action IN ('chat_post','rsvp')
    WHEN _role IN ('board') THEN
      _action IN ('post_news','manage_finances','chat_announce')
    ELSE false
  END;
$$;

-- Authoritative permission check
CREATE OR REPLACE FUNCTION public.clan_member_can(_clan_id uuid, _user_id uuid, _action text)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role text;
  v_override boolean;
  v_is_owner boolean;
BEGIN
  IF _user_id IS NULL THEN RETURN false; END IF;
  IF is_admin(_user_id) THEN RETURN true; END IF;

  SELECT (captain_profile_id = _user_id OR owner_profile_id = _user_id)
    INTO v_is_owner FROM public.clans WHERE id = _clan_id;
  IF COALESCE(v_is_owner, false) THEN RETURN true; END IF;

  SELECT cm.member_role::text INTO v_role
  FROM public.clan_members cm
  JOIN public.players p ON p.id = cm.player_id
  WHERE cm.clan_id = _clan_id AND p.profile_id = _user_id
  LIMIT 1;

  IF v_role IS NULL THEN RETURN false; END IF;

  SELECT enabled INTO v_override
  FROM public.clan_role_permissions
  WHERE clan_id = _clan_id AND role = v_role AND permission_key = _action;

  IF v_override IS NOT NULL THEN RETURN v_override; END IF;
  RETURN public.clan_default_role_perm(v_role, _action);
END;
$$;

-- ========== Tournament moderation infrastructure ==========
CREATE TABLE IF NOT EXISTS public.tournament_disputes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  match_id uuid,
  opened_by uuid NOT NULL,
  opened_against uuid,
  category text NOT NULL DEFAULT 'other',
  description text NOT NULL,
  evidence_urls text[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'open',
  resolution text,
  resolved_by uuid,
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_tdisputes_tournament ON public.tournament_disputes(tournament_id);
CREATE INDEX IF NOT EXISTS idx_tdisputes_status ON public.tournament_disputes(status);

ALTER TABLE public.tournament_disputes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tdisputes opener read" ON public.tournament_disputes
  FOR SELECT USING (
    opened_by = auth.uid()
    OR is_admin(auth.uid())
    OR EXISTS (SELECT 1 FROM public.tournaments t WHERE t.id = tournament_id AND t.created_by = auth.uid())
    OR EXISTS (SELECT 1 FROM public.tournament_staff ts WHERE ts.tournament_id = tournament_disputes.tournament_id AND ts.user_id = auth.uid())
  );

CREATE POLICY "tdisputes participants insert" ON public.tournament_disputes
  FOR INSERT WITH CHECK (opened_by = auth.uid());

CREATE POLICY "tdisputes staff update" ON public.tournament_disputes
  FOR UPDATE USING (
    is_admin(auth.uid())
    OR EXISTS (SELECT 1 FROM public.tournaments t WHERE t.id = tournament_id AND t.created_by = auth.uid())
    OR EXISTS (SELECT 1 FROM public.tournament_staff ts WHERE ts.tournament_id = tournament_disputes.tournament_id AND ts.user_id = auth.uid() AND 'disputes' = ANY(ts.permissions))
  );

CREATE TABLE IF NOT EXISTS public.tournament_moderation_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  actor_user_id uuid,
  action text NOT NULL,
  target_id uuid,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_tmod_tournament ON public.tournament_moderation_actions(tournament_id, created_at DESC);

ALTER TABLE public.tournament_moderation_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tmod staff read" ON public.tournament_moderation_actions
  FOR SELECT USING (
    is_admin(auth.uid())
    OR EXISTS (SELECT 1 FROM public.tournaments t WHERE t.id = tournament_id AND t.created_by = auth.uid())
    OR EXISTS (SELECT 1 FROM public.tournament_staff ts WHERE ts.tournament_id = tournament_moderation_actions.tournament_id AND ts.user_id = auth.uid())
  );

CREATE POLICY "tmod staff insert" ON public.tournament_moderation_actions
  FOR INSERT WITH CHECK (
    is_admin(auth.uid())
    OR EXISTS (SELECT 1 FROM public.tournaments t WHERE t.id = tournament_id AND t.created_by = auth.uid())
    OR EXISTS (SELECT 1 FROM public.tournament_staff ts WHERE ts.tournament_id = tournament_moderation_actions.tournament_id AND ts.user_id = auth.uid())
  );

-- Tournament permission helper
CREATE OR REPLACE FUNCTION public.tournament_user_can(_tournament_id uuid, _user_id uuid, _action text)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_creator uuid;
  v_perms text[];
BEGIN
  IF _user_id IS NULL THEN RETURN false; END IF;
  IF is_admin(_user_id) THEN RETURN true; END IF;
  SELECT created_by INTO v_creator FROM public.tournaments WHERE id = _tournament_id;
  IF v_creator = _user_id THEN RETURN true; END IF;
  SELECT permissions INTO v_perms FROM public.tournament_staff
   WHERE tournament_id = _tournament_id AND user_id = _user_id LIMIT 1;
  IF v_perms IS NULL THEN RETURN false; END IF;
  RETURN _action = ANY(v_perms) OR 'all' = ANY(v_perms);
END;
$$;

-- === 20260502194611_ff149742-2c02-492a-b0fe-cae3c3e47b9c.sql ===
-- ========== TRUST & SAFETY ==========
CREATE TABLE IF NOT EXISTS public.user_trust_scores (
  user_id uuid PRIMARY KEY,
  score integer NOT NULL DEFAULT 100,
  tier text NOT NULL DEFAULT 'standard',
  last_action_at timestamptz NOT NULL DEFAULT now(),
  notes text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.user_trust_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "trust self read" ON public.user_trust_scores
  FOR SELECT USING (user_id = auth.uid() OR is_admin(auth.uid()));
CREATE POLICY "trust admin write" ON public.user_trust_scores
  FOR ALL USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

CREATE OR REPLACE FUNCTION public.user_trust(_user_id uuid)
RETURNS text LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE v_tier text;
BEGIN
  IF _user_id IS NULL THEN RETURN 'new'; END IF;
  SELECT tier INTO v_tier FROM public.user_trust_scores WHERE user_id = _user_id;
  IF v_tier IS NULL THEN RETURN 'standard'; END IF;
  RETURN v_tier;
END;
$$;

CREATE OR REPLACE FUNCTION public.apply_trust_delta(_user_id uuid, _delta int, _reason text DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_new int; v_tier text;
BEGIN
  INSERT INTO public.user_trust_scores (user_id, score) VALUES (_user_id, 100)
    ON CONFLICT (user_id) DO NOTHING;
  UPDATE public.user_trust_scores SET score = GREATEST(0, LEAST(1000, score + _delta)), last_action_at = now(), updated_at = now()
    WHERE user_id = _user_id RETURNING score INTO v_new;
  v_tier := CASE
    WHEN v_new <= 0   THEN 'banned'
    WHEN v_new <  40  THEN 'restricted'
    WHEN v_new <  80  THEN 'new'
    WHEN v_new < 200  THEN 'standard'
    ELSE 'trusted'
  END;
  UPDATE public.user_trust_scores SET tier = v_tier, notes = COALESCE(_reason, notes) WHERE user_id = _user_id;
END;
$$;

-- ========== SHADOW BANS ==========
CREATE TABLE IF NOT EXISTS public.shadow_bans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  reason text,
  scope text NOT NULL DEFAULT 'global',
  community_id uuid,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz
);
ALTER TABLE public.shadow_bans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sban admin read" ON public.shadow_bans
  FOR SELECT USING (is_admin(auth.uid()) OR (community_id IS NOT NULL AND is_community_admin(auth.uid(), community_id)));
CREATE POLICY "sban admin write" ON public.shadow_bans
  FOR ALL USING (is_admin(auth.uid()) OR (community_id IS NOT NULL AND is_community_admin(auth.uid(), community_id)))
  WITH CHECK (is_admin(auth.uid()) OR (community_id IS NOT NULL AND is_community_admin(auth.uid(), community_id)));

CREATE OR REPLACE FUNCTION public.is_shadow_banned(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS(SELECT 1 FROM public.shadow_bans WHERE user_id = _user_id AND (expires_at IS NULL OR expires_at > now()));
$$;

-- ========== APPEALS ==========
CREATE TABLE IF NOT EXISTS public.moderation_appeals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  subject text NOT NULL,
  context text NOT NULL,
  related_entity_type text,
  related_entity_id uuid,
  status text NOT NULL DEFAULT 'pending',
  reviewer_id uuid,
  reviewer_notes text,
  decided_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.moderation_appeals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "appeal self read" ON public.moderation_appeals
  FOR SELECT USING (user_id = auth.uid() OR is_admin(auth.uid()));
CREATE POLICY "appeal self insert" ON public.moderation_appeals
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "appeal admin update" ON public.moderation_appeals
  FOR UPDATE USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

-- ========== WATCHWORDS ==========
CREATE TABLE IF NOT EXISTS public.watchwords (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pattern text NOT NULL,
  severity text NOT NULL DEFAULT 'flag',
  community_id uuid,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_watchwords_community ON public.watchwords(community_id);
ALTER TABLE public.watchwords ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ww public read" ON public.watchwords FOR SELECT USING (true);
CREATE POLICY "ww admin write" ON public.watchwords
  FOR ALL USING (is_admin(auth.uid()) OR (community_id IS NOT NULL AND is_community_admin(auth.uid(), community_id)))
  WITH CHECK (is_admin(auth.uid()) OR (community_id IS NOT NULL AND is_community_admin(auth.uid(), community_id)));

-- ========== COMMUNITY RULE PACKS ==========
CREATE TABLE IF NOT EXISTS public.community_rule_packs (
  community_id uuid PRIMARY KEY,
  who_can_create_clans text NOT NULL DEFAULT 'anyone',
  min_clan_size int NOT NULL DEFAULT 1,
  max_clan_size int NOT NULL DEFAULT 30,
  allowed_regions text[] NOT NULL DEFAULT ARRAY[]::text[],
  news_auto_publish boolean NOT NULL DEFAULT false,
  default_tournament_settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  banned_user_ids uuid[] NOT NULL DEFAULT ARRAY[]::uuid[],
  rules_md text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.community_rule_packs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "crp public read" ON public.community_rule_packs FOR SELECT USING (true);
CREATE POLICY "crp admin write" ON public.community_rule_packs
  FOR ALL USING (is_admin(auth.uid()) OR is_community_admin(auth.uid(), community_id))
  WITH CHECK (is_admin(auth.uid()) OR is_community_admin(auth.uid(), community_id));

-- ========== ENTITY LOCKS ==========
CREATE TABLE IF NOT EXISTS public.entity_locks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  reason text NOT NULL,
  locked_by uuid,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (entity_type, entity_id)
);
ALTER TABLE public.entity_locks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "elock public read" ON public.entity_locks FOR SELECT USING (true);
CREATE POLICY "elock admin write" ON public.entity_locks
  FOR ALL USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

CREATE OR REPLACE FUNCTION public.is_entity_locked(_type text, _id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.entity_locks
    WHERE entity_type = _type AND entity_id = _id
      AND (expires_at IS NULL OR expires_at > now())
  );
$$;

-- ========== AUTO-LOCK ON REPORTS ==========
CREATE OR REPLACE FUNCTION public.auto_lock_on_reports()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_count int;
BEGIN
  IF NEW.target_type NOT IN ('clan','tournament','user','match') THEN RETURN NEW; END IF;
  SELECT count(*) INTO v_count FROM public.reports
   WHERE target_type = NEW.target_type AND target_id = NEW.target_id
     AND status = 'open' AND created_at > now() - interval '24 hours';
  IF v_count >= 3 AND NOT EXISTS (
    SELECT 1 FROM public.entity_locks WHERE entity_type = NEW.target_type AND entity_id = NEW.target_id
  ) THEN
    INSERT INTO public.entity_locks (entity_type, entity_id, reason, expires_at)
      VALUES (NEW.target_type, NEW.target_id, 'Auto-locked: 3+ open reports in 24h', now() + interval '7 days')
      ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auto_lock_on_reports ON public.reports;
CREATE TRIGGER trg_auto_lock_on_reports
AFTER INSERT ON public.reports
FOR EACH ROW EXECUTE FUNCTION public.auto_lock_on_reports();

-- === 20260502200449_5911290a-351b-4c73-97d8-3f814b0e4a53.sql ===
-- ============= TRANCHE A: bracket progression + dispute SLA =============
ALTER TABLE public.bracket_matches ADD COLUMN IF NOT EXISTS propagated boolean NOT NULL DEFAULT false;
ALTER TABLE public.bracket_matches ADD COLUMN IF NOT EXISTS next_slot text CHECK (next_slot IN ('a','b'));

ALTER TABLE public.tournament_disputes ADD COLUMN IF NOT EXISTS escalated boolean NOT NULL DEFAULT false;
ALTER TABLE public.tournament_disputes ADD COLUMN IF NOT EXISTS escalated_at timestamptz;

-- ============= TRANCHE B: watchword auto-flag =============
CREATE OR REPLACE FUNCTION public.watchword_check(_text text, _community uuid)
RETURNS TABLE(pattern text, severity text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT w.pattern, w.severity FROM public.watchwords w
  WHERE (w.community_id IS NULL OR w.community_id = _community)
    AND _text ILIKE '%' || w.pattern || '%'
$$;

CREATE OR REPLACE FUNCTION public.watchword_guard_chat()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE hit record; cm uuid;
BEGIN
  SELECT community_id INTO cm FROM public.clans WHERE id = NEW.clan_id;
  FOR hit IN SELECT * FROM public.watchword_check(NEW.message, cm) LIMIT 1 LOOP
    IF hit.severity = 'block' THEN
      RAISE EXCEPTION 'Message blocked: contains forbidden phrase "%"', hit.pattern;
    END IF;
    -- flag: insert report + apply trust delta
    INSERT INTO public.reports (target_type, target_id, reporter_user_id, reason, status)
      VALUES ('chat_message', NEW.id, NEW.sender_user_id, 'watchword:'||hit.pattern, 'open')
      ON CONFLICT DO NOTHING;
    PERFORM public.apply_trust_delta(NEW.sender_user_id, -5, 'watchword:'||hit.pattern);
  END LOOP;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_watchword_chat ON public.clan_chat_messages;
CREATE TRIGGER trg_watchword_chat BEFORE INSERT ON public.clan_chat_messages
FOR EACH ROW EXECUTE FUNCTION public.watchword_guard_chat();

CREATE OR REPLACE FUNCTION public.watchword_guard_feed()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE hit record; cm uuid;
BEGIN
  SELECT community_id INTO cm FROM public.clans WHERE id = NEW.clan_id;
  FOR hit IN SELECT * FROM public.watchword_check(COALESCE(NEW.body,''), cm) LIMIT 1 LOOP
    IF hit.severity = 'block' THEN
      RAISE EXCEPTION 'Post blocked: contains forbidden phrase "%"', hit.pattern;
    END IF;
    INSERT INTO public.reports (target_type, target_id, reporter_user_id, reason, status)
      VALUES ('feed_post', NEW.id, NEW.author_user_id, 'watchword:'||hit.pattern, 'open')
      ON CONFLICT DO NOTHING;
    PERFORM public.apply_trust_delta(NEW.author_user_id, -5, 'watchword:'||hit.pattern);
  END LOOP;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_watchword_feed ON public.clan_feed_posts;
CREATE TRIGGER trg_watchword_feed BEFORE INSERT ON public.clan_feed_posts
FOR EACH ROW EXECUTE FUNCTION public.watchword_guard_feed();

-- ============= TRANCHE B: community rule pack enforcement =============
CREATE OR REPLACE FUNCTION public.enforce_community_rules_on_clan()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE rp public.community_rule_packs%ROWTYPE;
BEGIN
  IF NEW.community_id IS NULL THEN RETURN NEW; END IF;
  SELECT * INTO rp FROM public.community_rule_packs WHERE community_id = NEW.community_id;
  IF NOT FOUND THEN RETURN NEW; END IF;

  -- Region whitelist
  IF array_length(rp.allowed_regions,1) > 0 AND NEW.region IS NOT NULL
     AND NOT (NEW.region = ANY(rp.allowed_regions)) THEN
    RAISE EXCEPTION 'Region "%" is not allowed in this community', NEW.region;
  END IF;

  -- Banned user
  IF NEW.captain_profile_id = ANY(rp.banned_user_ids) THEN
    RAISE EXCEPTION 'You are banned from creating clans in this community';
  END IF;

  -- Who can create
  IF rp.who_can_create_clans = 'admins_only' AND NOT public.is_community_admin(auth.uid(), NEW.community_id) THEN
    RAISE EXCEPTION 'Only community admins can create clans here';
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_enforce_community_rules ON public.clans;
CREATE TRIGGER trg_enforce_community_rules BEFORE INSERT ON public.clans
FOR EACH ROW EXECUTE FUNCTION public.enforce_community_rules_on_clan();

-- ============= INVITE-AS-REQUEST RULE =============
-- Block direct clan_members inserts unless: admin, system flow (via accepted invite/join_request),
-- player joining themselves (their own profile claim flow), or player_id has no profile yet (created by leader).
CREATE OR REPLACE FUNCTION public.guard_clan_member_direct_add()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE has_invite boolean; has_request boolean; player_pid uuid; my_pid uuid;
BEGIN
  -- Allow admin / no-auth (system)
  IF auth.uid() IS NULL OR public.is_admin(auth.uid()) THEN RETURN NEW; END IF;

  -- Allow if there's an accepted invite for this player+clan
  SELECT EXISTS(SELECT 1 FROM public.clan_invites
    WHERE clan_id = NEW.clan_id AND invited_player_id = NEW.player_id
      AND status IN ('accepted','accepted_pending'))
    INTO has_invite;
  IF has_invite THEN RETURN NEW; END IF;

  -- Allow if there's an approved join_request
  SELECT EXISTS(SELECT 1 FROM public.clan_join_requests
    WHERE clan_id = NEW.clan_id AND player_id = NEW.player_id
      AND status IN ('approved','accepted'))
    INTO has_request;
  IF has_request THEN RETURN NEW; END IF;

  -- Allow self-join (player joining own profile, e.g. via leader-created link code claim)
  SELECT profile_id INTO player_pid FROM public.players WHERE id = NEW.player_id;
  IF player_pid = auth.uid() THEN RETURN NEW; END IF;

  -- Allow leader-created shadow players (no profile_id yet) â€” the leader_create_player flow
  IF player_pid IS NULL THEN RETURN NEW; END IF;

  RAISE EXCEPTION 'INVITE_REQUIRED: send an invite â€” players must accept before joining';
END $$;

DROP TRIGGER IF EXISTS trg_guard_clan_member_add ON public.clan_members;
CREATE TRIGGER trg_guard_clan_member_add BEFORE INSERT ON public.clan_members
FOR EACH ROW EXECUTE FUNCTION public.guard_clan_member_direct_add();

-- ============= TRANCHE C: free-agent cooldown =============
CREATE OR REPLACE FUNCTION public.guard_clan_join_cooldown()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE last_left timestamptz;
BEGIN
  IF auth.uid() IS NULL OR public.is_admin(auth.uid()) THEN RETURN NEW; END IF;
  SELECT MAX(left_at) INTO last_left FROM public.player_clan_history
    WHERE player_id = NEW.player_id AND left_at IS NOT NULL;
  IF last_left IS NOT NULL AND last_left > now() - interval '7 days' THEN
    RAISE EXCEPTION 'COOLDOWN: this player left a clan within the last 7 days. Try again after %', (last_left + interval '7 days')::date;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_clan_member_cooldown ON public.clan_members;
CREATE TRIGGER trg_clan_member_cooldown BEFORE INSERT ON public.clan_members
FOR EACH ROW EXECUTE FUNCTION public.guard_clan_join_cooldown();

-- ============= TRANCHE C: clan invite acceptance fanout =============
CREATE OR REPLACE FUNCTION public.handle_clan_invite_accept()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status = 'accepted' AND OLD.status <> 'accepted' THEN
    INSERT INTO public.clan_members (clan_id, player_id, member_role)
      VALUES (NEW.clan_id, NEW.invited_player_id, 'player')
      ON CONFLICT DO NOTHING;
    UPDATE public.players SET current_clan_id = NEW.clan_id WHERE id = NEW.invited_player_id;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_clan_invite_accept ON public.clan_invites;
CREATE TRIGGER trg_clan_invite_accept AFTER UPDATE ON public.clan_invites
FOR EACH ROW EXECUTE FUNCTION public.handle_clan_invite_accept();

-- === 20260502201210_0b20ddb8-36ae-4d97-a7a4-b3f6a7a39006.sql ===
-- ============================================================
-- FINALIZATION MIGRATION: Friends, DMs, Global Feed, Match Invites
-- ============================================================

-- ============ FRIENDS ============
CREATE TABLE IF NOT EXISTS public.friend_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id uuid NOT NULL,
  to_user_id uuid NOT NULL,
  message text,
  status text NOT NULL DEFAULT 'pending', -- pending|accepted|declined|cancelled
  created_at timestamptz NOT NULL DEFAULT now(),
  responded_at timestamptz,
  UNIQUE(from_user_id, to_user_id)
);
ALTER TABLE public.friend_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "view own friend requests" ON public.friend_requests FOR SELECT
  USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);
CREATE POLICY "send friend request" ON public.friend_requests FOR INSERT
  WITH CHECK (auth.uid() = from_user_id AND from_user_id <> to_user_id);
CREATE POLICY "respond to friend request" ON public.friend_requests FOR UPDATE
  USING (auth.uid() = to_user_id OR auth.uid() = from_user_id);

CREATE TABLE IF NOT EXISTS public.friendships (
  user_a uuid NOT NULL,
  user_b uuid NOT NULL,
  since timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_a, user_b),
  CHECK (user_a < user_b)
);
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "see own friendships" ON public.friendships FOR SELECT
  USING (auth.uid() = user_a OR auth.uid() = user_b);
CREATE POLICY "delete own friendships" ON public.friendships FOR DELETE
  USING (auth.uid() = user_a OR auth.uid() = user_b);

-- Helper
CREATE OR REPLACE FUNCTION public.are_friends(_a uuid, _b uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public
AS $$ SELECT EXISTS(
  SELECT 1 FROM public.friendships
  WHERE (user_a = LEAST(_a,_b) AND user_b = GREATEST(_a,_b))
) $$;

-- On accept -> create friendship + notify
CREATE OR REPLACE FUNCTION public.handle_friend_request_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE pa text; pb text;
BEGIN
  IF NEW.status = 'accepted' AND OLD.status = 'pending' THEN
    INSERT INTO public.friendships(user_a, user_b)
      VALUES (LEAST(NEW.from_user_id, NEW.to_user_id), GREATEST(NEW.from_user_id, NEW.to_user_id))
      ON CONFLICT DO NOTHING;
    NEW.responded_at := now();
    SELECT display_name INTO pa FROM public.profiles WHERE id = NEW.to_user_id;
    PERFORM public.notify_user(NEW.from_user_id, 'friend_accepted', 'Friend request accepted',
      COALESCE(pa,'Someone') || ' accepted your friend request', '/friends');
  ELSIF NEW.status = 'declined' AND OLD.status = 'pending' THEN
    NEW.responded_at := now();
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_friend_request_change BEFORE UPDATE ON public.friend_requests
  FOR EACH ROW EXECUTE FUNCTION public.handle_friend_request_change();

-- On insert -> notify recipient
CREATE OR REPLACE FUNCTION public.notify_friend_request()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE pname text;
BEGIN
  SELECT display_name INTO pname FROM public.profiles WHERE id = NEW.from_user_id;
  PERFORM public.notify_user(NEW.to_user_id, 'friend_request', 'New friend request',
    COALESCE(pname,'Someone') || ' wants to be your friend', '/friends',
    jsonb_build_object('request_id', NEW.id, 'from_user_id', NEW.from_user_id));
  RETURN NEW;
END $$;
CREATE TRIGGER trg_notify_friend_request AFTER INSERT ON public.friend_requests
  FOR EACH ROW EXECUTE FUNCTION public.notify_friend_request();

-- ============ DMs ============
CREATE TABLE IF NOT EXISTS public.dm_threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a uuid NOT NULL,
  user_b uuid NOT NULL,
  last_message_at timestamptz NOT NULL DEFAULT now(),
  last_message_preview text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_a, user_b),
  CHECK (user_a < user_b)
);
ALTER TABLE public.dm_threads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view own threads" ON public.dm_threads FOR SELECT
  USING (auth.uid() = user_a OR auth.uid() = user_b);
CREATE POLICY "create thread with friend" ON public.dm_threads FOR INSERT
  WITH CHECK ((auth.uid() = user_a OR auth.uid() = user_b) AND public.are_friends(user_a, user_b));

CREATE TABLE IF NOT EXISTS public.dm_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid NOT NULL REFERENCES public.dm_threads(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  read_at timestamptz,
  flagged boolean NOT NULL DEFAULT false
);
ALTER TABLE public.dm_messages ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_dm_messages_thread ON public.dm_messages(thread_id, created_at DESC);

CREATE POLICY "view own dms" ON public.dm_messages FOR SELECT USING (
  EXISTS(SELECT 1 FROM public.dm_threads t WHERE t.id = thread_id AND (auth.uid() = t.user_a OR auth.uid() = t.user_b))
);
CREATE POLICY "send own dm" ON public.dm_messages FOR INSERT WITH CHECK (
  auth.uid() = sender_id
  AND EXISTS(SELECT 1 FROM public.dm_threads t WHERE t.id = thread_id AND (auth.uid() = t.user_a OR auth.uid() = t.user_b))
  AND NOT public.is_shadow_banned(auth.uid())
);
CREATE POLICY "mark own dm read" ON public.dm_messages FOR UPDATE USING (
  EXISTS(SELECT 1 FROM public.dm_threads t WHERE t.id = thread_id AND (auth.uid() = t.user_a OR auth.uid() = t.user_b))
);

-- After message: bump thread + notify
CREATE OR REPLACE FUNCTION public.after_dm_message()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE t public.dm_threads%ROWTYPE; recipient uuid; sname text;
BEGIN
  SELECT * INTO t FROM public.dm_threads WHERE id = NEW.thread_id;
  recipient := CASE WHEN t.user_a = NEW.sender_id THEN t.user_b ELSE t.user_a END;
  UPDATE public.dm_threads SET last_message_at = NEW.created_at,
    last_message_preview = LEFT(NEW.body, 120) WHERE id = NEW.thread_id;
  SELECT display_name INTO sname FROM public.profiles WHERE id = NEW.sender_id;
  PERFORM public.notify_user(recipient, 'dm', 'New message from ' || COALESCE(sname,'a friend'),
    LEFT(NEW.body,140), '/messages/' || NEW.thread_id);
  RETURN NEW;
END $$;
CREATE TRIGGER trg_after_dm_message AFTER INSERT ON public.dm_messages
  FOR EACH ROW EXECUTE FUNCTION public.after_dm_message();

-- Realtime
ALTER TABLE public.dm_messages REPLICA IDENTITY FULL;
ALTER TABLE public.dm_threads REPLICA IDENTITY FULL;
ALTER TABLE public.friend_requests REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.dm_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.dm_threads;
ALTER PUBLICATION supabase_realtime ADD TABLE public.friend_requests;

-- ============ GLOBAL FEED ============
CREATE TABLE IF NOT EXISTS public.global_feed_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid NOT NULL,
  body text,
  media_url text,
  link_url text,
  visibility text NOT NULL DEFAULT 'public', -- public|friends
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  flagged boolean NOT NULL DEFAULT false,
  hidden_at timestamptz,
  hidden_by uuid,
  reach_score int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.global_feed_posts ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_gfp_recent ON public.global_feed_posts(created_at DESC) WHERE hidden_at IS NULL;

CREATE POLICY "view public feed" ON public.global_feed_posts FOR SELECT USING (
  hidden_at IS NULL AND (
    visibility = 'public'
    OR author_id = auth.uid()
    OR (visibility = 'friends' AND public.are_friends(auth.uid(), author_id))
  )
);
CREATE POLICY "create own post" ON public.global_feed_posts FOR INSERT
  WITH CHECK (auth.uid() = author_id AND NOT public.is_shadow_banned(auth.uid()));
CREATE POLICY "update own post" ON public.global_feed_posts FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "delete own post" ON public.global_feed_posts FOR DELETE USING (auth.uid() = author_id OR public.is_admin(auth.uid()));
CREATE POLICY "admin moderate post" ON public.global_feed_posts FOR UPDATE USING (public.is_admin(auth.uid()));

CREATE TABLE IF NOT EXISTS public.global_feed_likes (
  post_id uuid NOT NULL REFERENCES public.global_feed_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (post_id, user_id)
);
ALTER TABLE public.global_feed_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view likes" ON public.global_feed_likes FOR SELECT USING (true);
CREATE POLICY "like own" ON public.global_feed_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "unlike own" ON public.global_feed_likes FOR DELETE USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.global_feed_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.global_feed_posts(id) ON DELETE CASCADE,
  author_id uuid NOT NULL,
  body text NOT NULL,
  flagged boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.global_feed_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view comments" ON public.global_feed_comments FOR SELECT USING (true);
CREATE POLICY "comment if not banned" ON public.global_feed_comments FOR INSERT
  WITH CHECK (auth.uid() = author_id AND NOT public.is_shadow_banned(auth.uid()));
CREATE POLICY "delete own comment" ON public.global_feed_comments FOR DELETE
  USING (auth.uid() = author_id OR public.is_admin(auth.uid()));

-- Watchword enforcement on global feed + DM
CREATE OR REPLACE FUNCTION public.scan_watchwords(_text text)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
DECLARE w record; matched text[] := '{}'; severity text := 'none';
BEGIN
  IF _text IS NULL THEN RETURN jsonb_build_object('matched','{}'::text[],'severity','none'); END IF;
  FOR w IN SELECT pattern, severity AS sev FROM public.watchwords WHERE active = true LOOP
    IF _text ~* w.pattern THEN
      matched := array_append(matched, w.pattern);
      IF w.sev = 'block' THEN severity := 'block';
      ELSIF w.sev = 'flag' AND severity <> 'block' THEN severity := 'flag';
      END IF;
    END IF;
  END LOOP;
  RETURN jsonb_build_object('matched', to_jsonb(matched), 'severity', severity);
END $$;

CREATE OR REPLACE FUNCTION public.trg_watchword_global_feed()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE r jsonb;
BEGIN
  r := public.scan_watchwords(COALESCE(NEW.body,''));
  IF (r->>'severity') = 'block' THEN RAISE EXCEPTION 'BLOCKED_CONTENT'; END IF;
  IF (r->>'severity') = 'flag' THEN NEW.flagged := true; PERFORM public.apply_trust_delta(NEW.author_id, -2, 'feed flag'); END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_wgfp BEFORE INSERT ON public.global_feed_posts FOR EACH ROW EXECUTE FUNCTION public.trg_watchword_global_feed();

CREATE OR REPLACE FUNCTION public.trg_watchword_dm()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE r jsonb;
BEGIN
  r := public.scan_watchwords(COALESCE(NEW.body,''));
  IF (r->>'severity') = 'block' THEN RAISE EXCEPTION 'BLOCKED_CONTENT'; END IF;
  IF (r->>'severity') = 'flag' THEN NEW.flagged := true; PERFORM public.apply_trust_delta(NEW.sender_id, -3, 'dm flag'); END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_wdm BEFORE INSERT ON public.dm_messages FOR EACH ROW EXECUTE FUNCTION public.trg_watchword_dm();

ALTER TABLE public.global_feed_posts REPLICA IDENTITY FULL;
ALTER TABLE public.global_feed_likes REPLICA IDENTITY FULL;
ALTER TABLE public.global_feed_comments REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.global_feed_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.global_feed_likes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.global_feed_comments;

-- ============ MATCH INVITES (request-first) ============
CREATE TABLE IF NOT EXISTS public.match_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES public.clan_match_rooms(id) ON DELETE CASCADE,
  from_clan_id uuid NOT NULL,
  to_clan_id uuid NOT NULL,
  proposed_at timestamptz,
  message text,
  status text NOT NULL DEFAULT 'pending', -- pending|accepted|declined|cancelled
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  responded_at timestamptz
);
ALTER TABLE public.match_invites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view related match invites" ON public.match_invites FOR SELECT USING (
  EXISTS(SELECT 1 FROM public.clans c WHERE c.id IN (from_clan_id, to_clan_id)
    AND (c.captain_profile_id = auth.uid() OR c.owner_profile_id = auth.uid()
         OR public.is_clan_moderator(auth.uid(), c.id, 'manage')))
  OR public.is_admin(auth.uid())
);
CREATE POLICY "send match invite" ON public.match_invites FOR INSERT WITH CHECK (
  auth.uid() = created_by AND
  EXISTS(SELECT 1 FROM public.clans c WHERE c.id = from_clan_id
    AND (c.captain_profile_id = auth.uid() OR c.owner_profile_id = auth.uid()
         OR public.is_clan_moderator(auth.uid(), c.id, 'manage')))
);
CREATE POLICY "respond match invite" ON public.match_invites FOR UPDATE USING (
  EXISTS(SELECT 1 FROM public.clans c WHERE c.id IN (from_clan_id, to_clan_id)
    AND (c.captain_profile_id = auth.uid() OR c.owner_profile_id = auth.uid()
         OR public.is_clan_moderator(auth.uid(), c.id, 'manage')))
);

CREATE OR REPLACE FUNCTION public.notify_match_invite()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE cap uuid; fname text; tname text;
BEGIN
  SELECT name INTO fname FROM public.clans WHERE id = NEW.from_clan_id;
  SELECT captain_profile_id, name INTO cap, tname FROM public.clans WHERE id = NEW.to_clan_id;
  PERFORM public.notify_user(cap, 'match_invite', 'New match request',
    COALESCE(fname,'A clan') || ' wants to play ' || COALESCE(tname,'your clan'),
    '/clans/' || NEW.to_clan_id, jsonb_build_object('invite_id', NEW.id));
  RETURN NEW;
END $$;
CREATE TRIGGER trg_notify_match_invite AFTER INSERT ON public.match_invites
  FOR EACH ROW EXECUTE FUNCTION public.notify_match_invite();

CREATE OR REPLACE FUNCTION public.handle_match_invite_response()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE new_room uuid; cap_from uuid;
BEGIN
  IF NEW.status = 'accepted' AND OLD.status = 'pending' THEN
    NEW.responded_at := now();
    INSERT INTO public.clan_match_rooms (clan_a_id, clan_b_id, match_type, scheduled_at, status, created_by)
      VALUES (NEW.from_clan_id, NEW.to_clan_id, 'scrim', NEW.proposed_at, 'scheduled', NEW.created_by)
      RETURNING id INTO new_room;
    NEW.room_id := new_room;
    SELECT captain_profile_id INTO cap_from FROM public.clans WHERE id = NEW.from_clan_id;
    PERFORM public.notify_user(cap_from, 'match_accepted', 'Match accepted',
      'Your match request was accepted', '/match-room/' || new_room);
  ELSIF NEW.status = 'declined' AND OLD.status = 'pending' THEN
    NEW.responded_at := now();
    SELECT captain_profile_id INTO cap_from FROM public.clans WHERE id = NEW.from_clan_id;
    PERFORM public.notify_user(cap_from, 'match_declined', 'Match declined',
      'Your match request was declined', '/clans/' || NEW.from_clan_id);
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_handle_match_invite_response BEFORE UPDATE ON public.match_invites
  FOR EACH ROW EXECUTE FUNCTION public.handle_match_invite_response();

-- ============ TOURNAMENT â†’ TROPHY pipeline ============
CREATE OR REPLACE FUNCTION public.award_tournament_trophies()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE final_match record; winner_clan uuid; runner_clan uuid; t public.tournaments%ROWTYPE;
BEGIN
  IF NEW.status = 'completed' AND OLD.status <> 'completed' THEN
    SELECT * INTO t FROM public.tournaments WHERE id = NEW.id;
    SELECT bm.*, ra.clan_id AS a_clan, rb.clan_id AS b_clan INTO final_match
      FROM public.bracket_matches bm
      LEFT JOIN public.tournament_registrations ra ON ra.id = bm.participant_a_id
      LEFT JOIN public.tournament_registrations rb ON rb.id = bm.participant_b_id
      WHERE bm.tournament_id = NEW.id AND bm.winner_id IS NOT NULL
      ORDER BY bm.round DESC, bm.match_number DESC LIMIT 1;
    IF final_match.winner_id IS NOT NULL THEN
      winner_clan := CASE WHEN final_match.winner_id = final_match.participant_a_id THEN final_match.a_clan ELSE final_match.b_clan END;
      runner_clan := CASE WHEN final_match.winner_id = final_match.participant_a_id THEN final_match.b_clan ELSE final_match.a_clan END;
      IF winner_clan IS NOT NULL THEN
        INSERT INTO public.clan_trophies (clan_id, tournament_id, title, placement, awarded_at)
          VALUES (winner_clan, NEW.id, COALESCE(t.title,'Tournament') || ' â€” Champion', 1, now())
          ON CONFLICT DO NOTHING;
        UPDATE public.clans SET elo = elo + 50 WHERE id = winner_clan;
      END IF;
      IF runner_clan IS NOT NULL THEN
        INSERT INTO public.clan_trophies (clan_id, tournament_id, title, placement, awarded_at)
          VALUES (runner_clan, NEW.id, COALESCE(t.title,'Tournament') || ' â€” Runner-up', 2, now())
          ON CONFLICT DO NOTHING;
        UPDATE public.clans SET elo = elo + 20 WHERE id = runner_clan;
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS trg_award_tournament_trophies ON public.tournaments;
CREATE TRIGGER trg_award_tournament_trophies AFTER UPDATE ON public.tournaments
  FOR EACH ROW EXECUTE FUNCTION public.award_tournament_trophies();


-- === 20260502201814_cf83e639-3f58-4dc5-bfd9-225086641643.sql ===
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  endpoint text NOT NULL UNIQUE,
  p256dh text NOT NULL,
  auth text NOT NULL,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_used_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_push_user ON public.push_subscriptions(user_id);

CREATE POLICY "view own push subs" ON public.push_subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "create own push sub" ON public.push_subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete own push sub" ON public.push_subscriptions FOR DELETE USING (auth.uid() = user_id);

-- After a notification is created, mark it for fanout via a column flag (the edge function polls)
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS pushed_at timestamptz;
CREATE INDEX IF NOT EXISTS idx_notifications_unpushed ON public.notifications(created_at) WHERE pushed_at IS NULL;

-- === 20260503141825_5c8bc0b8-9329-4a63-8d18-f61105f3d5b9.sql ===
-- RPC: opponent confirms or rejects a pending clan match result
CREATE OR REPLACE FUNCTION public.confirm_clan_match_result(
  _result_id uuid,
  _action text  -- 'confirm' or 'reject'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _result record;
  _room record;
  _clan_a record;
  _clan_b record;
  _is_a_capt boolean := false;
  _is_b_capt boolean := false;
  _opponent_clan uuid;
BEGIN
  IF _uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Sign in required');
  END IF;
  IF _action NOT IN ('confirm', 'reject') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Invalid action');
  END IF;

  SELECT * INTO _result FROM public.clan_match_results WHERE id = _result_id;
  IF NOT FOUND THEN RETURN jsonb_build_object('ok', false, 'error', 'Result not found'); END IF;
  IF _result.status <> 'pending' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Result already ' || _result.status);
  END IF;

  SELECT * INTO _room FROM public.clan_match_rooms WHERE id = _result.room_id;
  SELECT * INTO _clan_a FROM public.clans WHERE id = _room.clan_a_id;
  SELECT * INTO _clan_b FROM public.clans WHERE id = _room.clan_b_id;

  _is_a_capt := (_clan_a.captain_profile_id = _uid OR _clan_a.owner_profile_id = _uid);
  _is_b_capt := (_clan_b.captain_profile_id = _uid OR _clan_b.owner_profile_id = _uid);

  -- determine opponent clan id (the one that did NOT submit)
  IF _result.submitting_clan_id = _clan_a.id THEN
    _opponent_clan := _clan_b.id;
  ELSE
    _opponent_clan := _clan_a.id;
  END IF;

  -- only the opposing captain (or admin) may act
  IF NOT (
    public.is_admin(_uid)
    OR (_opponent_clan = _clan_a.id AND _is_a_capt)
    OR (_opponent_clan = _clan_b.id AND _is_b_capt)
  ) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Only the opposing clan captain can confirm');
  END IF;

  IF _action = 'confirm' THEN
    UPDATE public.clan_match_results
       SET status = 'confirmed'
     WHERE id = _result_id;
    RETURN jsonb_build_object('ok', true, 'status', 'confirmed');
  ELSE
    UPDATE public.clan_match_results
       SET status = 'disputed'
     WHERE id = _result_id;
    -- auto-open a dispute
    INSERT INTO public.clan_match_disputes (room_id, opened_by, reason, evidence_url)
    VALUES (_result.room_id, _uid, 'Opponent rejected submitted score (result ' || _result_id::text || ')', _result.evidence_url);
    RETURN jsonb_build_object('ok', true, 'status', 'disputed');
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.confirm_clan_match_result(uuid, text) TO authenticated;

-- === 20260503143947_009f466d-7f54-496a-85dd-b5247212ca01.sql ===
CREATE TABLE public.eleague_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  series_id uuid REFERENCES public.tournament_series(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'setup',
  pick_seconds integer NOT NULL DEFAULT 60,
  current_pick_index integer NOT NULL DEFAULT 0,
  current_pick_deadline timestamptz,
  started_at timestamptz,
  ended_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid
);

CREATE TABLE public.eleague_draft_pool (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  draft_id uuid NOT NULL REFERENCES public.eleague_drafts(id) ON DELETE CASCADE,
  player_id uuid REFERENCES public.players(id) ON DELETE SET NULL,
  profile_id uuid,
  display_name text,
  rate integer NOT NULL DEFAULT 2,
  notes text,
  drafted boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_eleague_pool_draft ON public.eleague_draft_pool(draft_id);

CREATE TABLE public.eleague_draft_order (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  draft_id uuid NOT NULL REFERENCES public.eleague_drafts(id) ON DELETE CASCADE,
  slot_index integer NOT NULL,
  team_id uuid NOT NULL REFERENCES public.esports_teams(id) ON DELETE CASCADE,
  round_number integer NOT NULL DEFAULT 1,
  UNIQUE (draft_id, slot_index)
);
CREATE INDEX idx_eleague_order_draft ON public.eleague_draft_order(draft_id);

CREATE TABLE public.eleague_draft_picks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  draft_id uuid NOT NULL REFERENCES public.eleague_drafts(id) ON DELETE CASCADE,
  slot_index integer NOT NULL,
  team_id uuid NOT NULL REFERENCES public.esports_teams(id) ON DELETE CASCADE,
  pool_entry_id uuid NOT NULL REFERENCES public.eleague_draft_pool(id) ON DELETE CASCADE,
  picked_at timestamptz NOT NULL DEFAULT now(),
  picked_by uuid,
  was_auto boolean NOT NULL DEFAULT false,
  UNIQUE (draft_id, slot_index)
);
CREATE INDEX idx_eleague_picks_draft ON public.eleague_draft_picks(draft_id);

CREATE TRIGGER trg_eleague_drafts_updated
  BEFORE UPDATE ON public.eleague_drafts
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

ALTER TABLE public.eleague_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eleague_draft_pool ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eleague_draft_order ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eleague_draft_picks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "drafts public read" ON public.eleague_drafts FOR SELECT USING (true);
CREATE POLICY "drafts admin write" ON public.eleague_drafts FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "pool public read" ON public.eleague_draft_pool FOR SELECT USING (true);
CREATE POLICY "pool admin write" ON public.eleague_draft_pool FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "order public read" ON public.eleague_draft_order FOR SELECT USING (true);
CREATE POLICY "order admin write" ON public.eleague_draft_order FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "picks public read" ON public.eleague_draft_picks FOR SELECT USING (true);
CREATE POLICY "picks admin write" ON public.eleague_draft_picks FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

ALTER PUBLICATION supabase_realtime ADD TABLE public.eleague_drafts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.eleague_draft_pool;
ALTER PUBLICATION supabase_realtime ADD TABLE public.eleague_draft_order;
ALTER PUBLICATION supabase_realtime ADD TABLE public.eleague_draft_picks;

-- === 20260503145140_9d0142b1-d918-4437-bdf0-7b7173251d96.sql ===
-- 1. notifications
DROP POLICY IF EXISTS "notif system insert" ON public.notifications;

-- 2. clan_match_player_rooms
DROP POLICY IF EXISTS "pvp system insert" ON public.clan_match_player_rooms;
CREATE POLICY "pvp authed insert"
ON public.clan_match_player_rooms
FOR INSERT TO authenticated
WITH CHECK (
  is_admin(auth.uid())
  OR EXISTS (
    SELECT 1
    FROM public.clan_match_rooms r
    JOIN public.clans c ON c.id = r.clan_a_id OR c.id = r.clan_b_id
    WHERE r.id = clan_match_player_rooms.room_id
      AND (c.captain_profile_id = auth.uid() OR c.owner_profile_id = auth.uid())
  )
);

-- 3. clan_audit_logs
DROP POLICY IF EXISTS "audit insert authed" ON public.clan_audit_logs;
CREATE POLICY "audit insert clan leaders"
ON public.clan_audit_logs
FOR INSERT TO authenticated
WITH CHECK (
  is_admin(auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.clans c
    WHERE c.id = clan_audit_logs.clan_id
      AND (c.captain_profile_id = auth.uid() OR c.owner_profile_id = auth.uid())
  )
);

-- 4. watchwords
DROP POLICY IF EXISTS "ww public read" ON public.watchwords;
CREATE POLICY "ww admin read"
ON public.watchwords FOR SELECT TO authenticated
USING (
  is_admin(auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.community_admins ca
    WHERE ca.user_id = auth.uid()
      AND (ca.expires_at IS NULL OR ca.expires_at > now())
  )
);

-- 5. clan_subscriptions
DO $$
DECLARE pol record;
BEGIN
  FOR pol IN SELECT polname FROM pg_policy
    WHERE polrelid='public.clan_subscriptions'::regclass AND polcmd='r'
  LOOP EXECUTE format('DROP POLICY %I ON public.clan_subscriptions', pol.polname); END LOOP;
END$$;
CREATE POLICY "clan_subs read scoped"
ON public.clan_subscriptions FOR SELECT
USING (
  is_admin(auth.uid())
  OR EXISTS (SELECT 1 FROM public.clans c
    WHERE c.id = clan_subscriptions.clan_id
      AND (c.captain_profile_id = auth.uid() OR c.owner_profile_id = auth.uid()))
  OR EXISTS (SELECT 1 FROM public.clan_members cm
    JOIN public.players p ON p.id = cm.player_id
    WHERE cm.clan_id = clan_subscriptions.clan_id AND p.profile_id = auth.uid())
);

-- 6. players: authenticated-only read + public-safe view
DO $$
DECLARE pol record;
BEGIN
  FOR pol IN SELECT polname FROM pg_policy
    WHERE polrelid='public.players'::regclass AND polcmd='r'
  LOOP EXECUTE format('DROP POLICY %I ON public.players', pol.polname); END LOOP;
END$$;
CREATE POLICY "players authed read"
ON public.players FOR SELECT TO authenticated USING (true);

CREATE OR REPLACE VIEW public.players_public AS
SELECT
  id, profile_id, gamertag, country, region, main_game, role,
  current_clan_id, wins, losses, goals_scored, goals_conceded,
  ranking_points, form, bio, avatar_url, flag, status, availability,
  verified, draft_eligible, playstyle, controller_type,
  preferred_formation, preferred_playstyle, preferred_foot,
  positions, jersey_number, years_playing, division, efootball_rating,
  social_links, languages, timezone, availability_hours,
  looking_for_clan, achievements, signature_players, career_highlights,
  coaching_available, streamer_url, verified_efootball, player_elo,
  overall_rating, card_position, custom_attributes, created_at
FROM public.players;
GRANT SELECT ON public.players_public TO anon, authenticated;

-- 7. clan_change_requests
DO $$
DECLARE pol record;
BEGIN
  FOR pol IN SELECT polname FROM pg_policy
    WHERE polrelid='public.clan_change_requests'::regclass AND polcmd='r'
  LOOP EXECUTE format('DROP POLICY %I ON public.clan_change_requests', pol.polname); END LOOP;
END$$;
CREATE POLICY "ccr scoped read"
ON public.clan_change_requests FOR SELECT
USING (
  is_admin(auth.uid())
  OR EXISTS (SELECT 1 FROM public.clans c
    WHERE c.id = clan_change_requests.clan_id
      AND (c.captain_profile_id = auth.uid() OR c.owner_profile_id = auth.uid()))
  OR EXISTS (SELECT 1 FROM public.clan_members cm
    JOIN public.players p ON p.id = cm.player_id
    WHERE cm.clan_id = clan_change_requests.clan_id AND p.profile_id = auth.uid())
);

-- 8. eligibility_overrides
DO $$
DECLARE pol record;
BEGIN
  FOR pol IN SELECT polname FROM pg_policy
    WHERE polrelid='public.eligibility_overrides'::regclass AND polcmd='r'
  LOOP EXECUTE format('DROP POLICY %I ON public.eligibility_overrides', pol.polname); END LOOP;
END$$;
CREATE POLICY "eo scoped read"
ON public.eligibility_overrides FOR SELECT
USING (
  is_admin(auth.uid())
  OR EXISTS (SELECT 1 FROM public.players p
    WHERE p.id = eligibility_overrides.player_id AND p.profile_id = auth.uid())
);

-- 9. clan_roster_snapshots
DO $$
DECLARE pol record;
BEGIN
  FOR pol IN SELECT polname FROM pg_policy
    WHERE polrelid='public.clan_roster_snapshots'::regclass AND polcmd='r'
  LOOP EXECUTE format('DROP POLICY %I ON public.clan_roster_snapshots', pol.polname); END LOOP;
END$$;
CREATE POLICY "crs scoped read"
ON public.clan_roster_snapshots FOR SELECT
USING (
  is_admin(auth.uid())
  OR EXISTS (SELECT 1 FROM public.clans c
    WHERE c.id = clan_roster_snapshots.clan_id
      AND (c.captain_profile_id = auth.uid() OR c.owner_profile_id = auth.uid()))
  OR EXISTS (SELECT 1 FROM public.clan_members cm
    JOIN public.players p ON p.id = cm.player_id
    WHERE cm.clan_id = clan_roster_snapshots.clan_id AND p.profile_id = auth.uid())
);

-- 10. community_rule_packs
DO $$
DECLARE pol record;
BEGIN
  FOR pol IN SELECT polname FROM pg_policy
    WHERE polrelid='public.community_rule_packs'::regclass AND polcmd='r'
  LOOP EXECUTE format('DROP POLICY %I ON public.community_rule_packs', pol.polname); END LOOP;
END$$;
CREATE POLICY "crp admin read"
ON public.community_rule_packs FOR SELECT
USING (
  is_admin(auth.uid())
  OR EXISTS (SELECT 1 FROM public.community_admins ca
    WHERE ca.user_id = auth.uid()
      AND ca.community_id = community_rule_packs.community_id
      AND (ca.expires_at IS NULL OR ca.expires_at > now()))
);

-- 11. clan_membership_cooldowns
DO $$
DECLARE pol record;
BEGIN
  FOR pol IN SELECT polname FROM pg_policy
    WHERE polrelid='public.clan_membership_cooldowns'::regclass AND polcmd='r'
  LOOP EXECUTE format('DROP POLICY %I ON public.clan_membership_cooldowns', pol.polname); END LOOP;
END$$;
CREATE POLICY "cmc scoped read"
ON public.clan_membership_cooldowns FOR SELECT
USING (
  is_admin(auth.uid())
  OR EXISTS (SELECT 1 FROM public.players p
    WHERE p.id = clan_membership_cooldowns.player_id AND p.profile_id = auth.uid())
  OR EXISTS (SELECT 1 FROM public.clans c
    WHERE c.id = clan_membership_cooldowns.clan_id
      AND (c.captain_profile_id = auth.uid() OR c.owner_profile_id = auth.uid()))
);

-- 12. Storage policies
DROP POLICY IF EXISTS "clan-banners authed update" ON storage.objects;
DROP POLICY IF EXISTS "clan-banners authed delete" ON storage.objects;
CREATE POLICY "clan-banners owner update"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'clan-banners' AND (auth.uid())::text = (storage.foldername(name))[1])
WITH CHECK (bucket_id = 'clan-banners' AND (auth.uid())::text = (storage.foldername(name))[1]);
CREATE POLICY "clan-banners owner delete"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'clan-banners' AND (auth.uid())::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "clan-logos authed update" ON storage.objects;
DROP POLICY IF EXISTS "clan-logos authed delete" ON storage.objects;
CREATE POLICY "clan-logos owner update"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'clan-logos' AND (auth.uid())::text = (storage.foldername(name))[1])
WITH CHECK (bucket_id = 'clan-logos' AND (auth.uid())::text = (storage.foldername(name))[1]);
CREATE POLICY "clan-logos owner delete"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'clan-logos' AND (auth.uid())::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "screenrec read involved" ON storage.objects;
CREATE POLICY "screenrec owner or admin read"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'screen-recordings'
  AND (
    (auth.uid())::text = (storage.foldername(name))[1]
    OR is_admin(auth.uid())
  )
);


-- === 20260503145202_8193da25-af21-4b22-95d2-e89250333ed0.sql ===
ALTER VIEW public.players_public SET (security_invoker = true);

-- === 20260503145226_b5e79979-5977-4d79-b13d-2bba725c1986.sql ===
ALTER VIEW public.players_public SET (security_invoker = false);
COMMENT ON VIEW public.players_public IS 'PII-safe public projection of players. Intentionally SECURITY DEFINER so anonymous visitors can browse public profile fields (gamertag, country, stats) while sensitive PII columns (date_of_birth, height_cm, device, in_game_id, etc.) on the base players table remain restricted to authenticated users.';

-- === 20260503145258_a48d1c16-0514-492e-b57f-8089cfc8f8f9.sql ===
-- Switch view to security_invoker (no more SECURITY DEFINER VIEW error)
ALTER VIEW public.players_public SET (security_invoker = true);

-- Allow anyone (incl. anon) to SELECT from players, but only on non-sensitive columns.
DROP POLICY IF EXISTS "players authed read" ON public.players;
CREATE POLICY "players public read"
ON public.players FOR SELECT
USING (true);

-- Column-level security: revoke sensitive columns from anon, keep them for authenticated.
REVOKE SELECT ON public.players FROM anon;
GRANT SELECT (
  id, profile_id, gamertag, country, region, main_game, role,
  current_clan_id, wins, losses, goals_scored, goals_conceded,
  ranking_points, form, bio, avatar_url, flag, status, availability,
  verified, draft_eligible, playstyle, controller_type,
  preferred_formation, preferred_playstyle, preferred_foot,
  positions, jersey_number, years_playing, division, efootball_rating,
  social_links, languages, timezone, availability_hours,
  looking_for_clan, achievements, signature_players, career_highlights,
  coaching_available, streamer_url, verified_efootball, player_elo,
  overall_rating, card_position, custom_attributes, created_at
) ON public.players TO anon;
-- authenticated keeps full SELECT
GRANT SELECT ON public.players TO authenticated;

-- === 20260503145705_117a0183-57d5-4b53-bebf-7b9e7280b990.sql ===
-- ===== 1. Pin search_path on helper functions =====
ALTER FUNCTION public.summarize_text(text, integer) SET search_path = public;
ALTER FUNCTION public.enqueue_email(text, jsonb) SET search_path = public, pgmq;
ALTER FUNCTION public.read_email_batch(text, integer, integer) SET search_path = public, pgmq;
ALTER FUNCTION public.delete_email(text, bigint) SET search_path = public, pgmq;
ALTER FUNCTION public.move_to_dlq(text, text, bigint, jsonb) SET search_path = public, pgmq;

-- ===== 2. Revoke EXECUTE on internal SECURITY DEFINER trigger / guard functions =====
REVOKE EXECUTE ON FUNCTION public.advance_bracket_after_report() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.after_dm_message() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.apply_clan_match_result() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.apply_pvp_result() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.apply_walkover() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.auto_create_clan_match_room() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.auto_lock_lineups() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.auto_lock_on_reports() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.auto_spawn_clan_room_from_bracket() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.auto_transition_tournament_status() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.autopost_match_result() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.autopost_trophy() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.award_tournament_trophies() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.clan_invite_cooldown_check() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.clan_join_request_guard() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.clan_member_size_guard() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.clan_owner_protect() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enforce_community_rules_on_clan() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.flag_big_clan_post() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.guard_clan_join_cooldown() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.guard_clan_member_direct_add() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.guard_duplicate_invite() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.guard_join_request_spam() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.guard_player_link_self_claim() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_clan_invite_accept() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_friend_request_change() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_match_invite_response() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.log_player_clan_change() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_bracket_advance() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_clan_invite() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_clan_join_request() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_dispute_resolved() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_friend_request() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_match_invite() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_match_result() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_registration_decision() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_registration_status() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.recalc_standings_after_match() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.refresh_playstyle_titles_trg() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.sponsors_expiring_soon() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.tournament_change_guard() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.tournament_registration_window_guard() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.tournament_staff_escalation_guard() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.trg_watchword_dm() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.trg_watchword_global_feed() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.watchword_guard_chat() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.watchword_guard_feed() FROM PUBLIC, anon, authenticated;

-- Internal helper RPCs that should never be called from the client
REVOKE EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.delete_email(text, bigint) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) FROM PUBLIC, anon, authenticated;

-- ===== 3. Public buckets: keep public URL access (which bypasses RLS),
--           but stop letting clients enumerate the bucket via the SDK.
--           The bucket SELECT policy is removed; objects remain accessible via their direct public URL.
DROP POLICY IF EXISTS "public buckets read" ON storage.objects;
DROP POLICY IF EXISTS "clan-banners public read" ON storage.objects;
DROP POLICY IF EXISTS "clan-logos public read" ON storage.objects;
DROP POLICY IF EXISTS "site-assets public read" ON storage.objects;
-- Note: public.<bucket>.* file URLs continue to work because the storage proxy serves
-- public buckets without consulting RLS.

-- ===== 4. sponsor_inquiries: only anonymous visitors may submit, with a body length cap
DROP POLICY IF EXISTS "sinq public insert" ON public.sponsor_inquiries;
CREATE POLICY "sinq anon submit"
ON public.sponsor_inquiries
FOR INSERT
TO anon
WITH CHECK (
  coalesce(length(message), 0) BETWEEN 1 AND 4000
  AND coalesce(length(email), 0) BETWEEN 3 AND 254
  AND coalesce(length(name), 0) BETWEEN 1 AND 200
);


-- === 20260503145810_b0e4f527-6517-4a4b-8fd5-96acfe1226b7.sql ===
REVOKE EXECUTE ON FUNCTION public.apply_trust_delta(_user_id uuid, _delta integer, _reason text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.approve_player_link(_code text, _approve boolean) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.are_friends(_a uuid, _b uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.can_create_tournaments(_user_id uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.can_invite_to_clan(_clan_id uuid, _user_id uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.can_kick_clan_member(_clan_id uuid, _target_user uuid, _actor uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.can_post_news(_user_id uuid, _community_id uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.captain_decide_join_request(_req_id uuid, _accept boolean) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.claim_player(_token text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.clan_member_can(_clan_id uuid, _user_id uuid, _action text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.community_inbox_post(_community_id uuid, _kind text, _title text, _body text, _link text, _data jsonb) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.compute_player_overall(_player_id uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.confirm_clan_match_result(_result_id uuid, _action text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.consume_clan_token(_token text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.decide_news_promotion(_req_id uuid, _approve boolean, _edited_summary text, _edited_title text, _category text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.derive_player_playstyle_titles(_player_id uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.expire_stale_recruitment(_days integer) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.finalize_clan_merge(_merge_id uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.grant_post_author(_user_id uuid, _scope text, _community_id uuid, _on boolean) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.has_active_subscription(user_uuid uuid, check_env text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_clan_member(_user_id uuid, _clan_id uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_clan_moderator(_user_id uuid, _clan_id uuid, _scope text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_clan_owner(_user_id uuid, _clan_id uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_clan_staff(_clan_id uuid, _user_id uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_community_admin(_user_id uuid, _community_id uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_community_super_admin(_user_id uuid, _community_id uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_entity_locked(_type text, _id uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_match_staff(_user_id uuid, _room_id uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_news_editor(_user_id uuid, _community_id uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_series_admin(_user_id uuid, _series_id uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_shadow_banned(_user_id uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_tournament_mod(_t_id uuid, _user uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.leader_create_player(_clan_id uuid, _gamertag text, _country text, _flag text, _role text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.notify_user(_user_id uuid, _type text, _title text, _body text, _link text, _data jsonb) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.register_clan_for_tournament(_tournament_id uuid, _clan_id uuid, _notes text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.request_news_promotion(_post_id uuid, _proposed_title text, _proposed_summary text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.request_player_link(_code text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.role_permission_enabled(_user_id uuid, _key text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.scan_watchwords(_text text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.set_user_verified(_user_id uuid, _kind text, _on boolean) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.staff_delete_match(_room_id uuid, _reason text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.staff_disqualify_clan(_room_id uuid, _dq_clan_id uuid, _reason text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.staff_edit_match_score(_room_id uuid, _score_a integer, _score_b integer, _reason text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.staff_force_submit_result(_room_id uuid, _score_a integer, _score_b integer, _reason text, _evidence_url text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.staff_rollback_match(_room_id uuid, _reason text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.staff_walkover(_room_id uuid, _winner_clan_id uuid, _reason text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.tournament_check_in(_registration_id uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.tournament_user_can(_tournament_id uuid, _user_id uuid, _action text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.user_can_create_clan(_user_id uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.user_has_valid_clan_token(_user_id uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.user_trust(_user_id uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.watchword_check(_text text, _community uuid) FROM PUBLIC, anon;

COMMENT ON FUNCTION public.validate_clan_token(text) IS
  'Intentionally callable by anon â€” used by the clan-token redemption page before the user signs in. The function only returns token validity metadata, no sensitive data.';


-- === 20260503145850_0f87753b-2200-43a1-b369-eb87efad0ec6.sql ===
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_admin(uuid) FROM PUBLIC, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_clan_member(uuid, uuid) FROM PUBLIC, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_clan_moderator(uuid, uuid, text) FROM PUBLIC, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_clan_owner(uuid, uuid) FROM PUBLIC, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_clan_staff(uuid, uuid) FROM PUBLIC, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_community_admin(uuid, uuid) FROM PUBLIC, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_community_super_admin(uuid, uuid) FROM PUBLIC, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_entity_locked(text, uuid) FROM PUBLIC, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_news_editor(uuid, uuid) FROM PUBLIC, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_series_admin(uuid, uuid) FROM PUBLIC, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_shadow_banned(uuid) FROM PUBLIC, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_tournament_mod(uuid, uuid) FROM PUBLIC, authenticated;
REVOKE EXECUTE ON FUNCTION public.user_trust(uuid) FROM PUBLIC, authenticated;
REVOKE EXECUTE ON FUNCTION public.user_has_valid_clan_token(uuid) FROM PUBLIC, authenticated;
REVOKE EXECUTE ON FUNCTION public.user_can_create_clan(uuid) FROM PUBLIC, authenticated;
REVOKE EXECUTE ON FUNCTION public.tournament_user_can(uuid, uuid, text) FROM PUBLIC, authenticated;
REVOKE EXECUTE ON FUNCTION public.role_permission_enabled(uuid, text) FROM PUBLIC, authenticated;
REVOKE EXECUTE ON FUNCTION public.can_invite_to_clan(uuid, uuid) FROM PUBLIC, authenticated;
REVOKE EXECUTE ON FUNCTION public.can_kick_clan_member(uuid, uuid, uuid) FROM PUBLIC, authenticated;
REVOKE EXECUTE ON FUNCTION public.can_post_news(uuid, uuid) FROM PUBLIC, authenticated;
REVOKE EXECUTE ON FUNCTION public.can_create_tournaments(uuid) FROM PUBLIC, authenticated;
REVOKE EXECUTE ON FUNCTION public.are_friends(uuid, uuid) FROM PUBLIC, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_active_subscription(uuid, text) FROM PUBLIC, authenticated;
REVOKE EXECUTE ON FUNCTION public.clan_member_can(uuid, uuid, text) FROM PUBLIC, authenticated;
REVOKE EXECUTE ON FUNCTION public.scan_watchwords(text) FROM PUBLIC, authenticated;
REVOKE EXECUTE ON FUNCTION public.watchword_check(text, uuid) FROM PUBLIC, authenticated;
REVOKE EXECUTE ON FUNCTION public.expire_stale_recruitment(integer) FROM PUBLIC, authenticated;
REVOKE EXECUTE ON FUNCTION public.community_inbox_post(uuid, text, text, text, text, jsonb) FROM PUBLIC, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_user(uuid, text, text, text, text, jsonb) FROM PUBLIC, authenticated;
REVOKE EXECUTE ON FUNCTION public.apply_trust_delta(uuid, integer, text) FROM PUBLIC, authenticated;


-- === 20260503150259_7638536f-d6be-4ae3-a21e-74a32952354b.sql ===
-- 1. Clan subscriptions: remove member read of Stripe IDs
DROP POLICY IF EXISTS "clan_subs read scoped" ON public.clan_subscriptions;
CREATE POLICY "clan_subs read leaders only"
ON public.clan_subscriptions FOR SELECT
USING (
  is_admin(auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.clans c
    WHERE c.id = clan_subscriptions.clan_id
      AND (c.captain_profile_id = auth.uid() OR c.owner_profile_id = auth.uid())
  )
);

-- 2. Players PII protection
DROP POLICY IF EXISTS "players public read" ON public.players;
CREATE POLICY "players row read all"
ON public.players FOR SELECT
USING (true);

-- Grant SELECT on safe public columns; revoke on PII columns.
GRANT SELECT (
  id, profile_id, gamertag, country, region, main_game, role, current_clan_id,
  wins, losses, goals_scored, goals_conceded, ranking_points, form, bio,
  avatar_url, flag, created_at, status, availability, verified, draft_eligible,
  playstyle, controller_type, preferred_formation, preferred_playstyle,
  preferred_foot, positions, jersey_number, years_playing, division,
  efootball_rating, social_links, languages, timezone, availability_hours,
  looking_for_clan, achievements, signature_players, career_highlights,
  coaching_available, streamer_url, verified_efootball, player_elo,
  overall_rating, card_position, custom_attributes
) ON public.players TO anon, authenticated;

REVOKE SELECT (date_of_birth, height_cm, device, device_model, in_game_id, in_game_name)
  ON public.players FROM anon, authenticated;

-- 3. Clan transfers: tighten INSERT
DROP POLICY IF EXISTS "tr authed insert" ON public.clan_transfers;
CREATE POLICY "tr scoped insert"
ON public.clan_transfers FOR INSERT TO authenticated
WITH CHECK (
  initiated_by = auth.uid()
  AND (
    EXISTS (SELECT 1 FROM public.players p WHERE p.id = clan_transfers.player_id AND p.profile_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.clans c
      WHERE (c.id = clan_transfers.to_clan_id OR c.id = clan_transfers.from_clan_id)
        AND (c.captain_profile_id = auth.uid() OR c.owner_profile_id = auth.uid())
    )
    OR is_admin(auth.uid())
  )
);

-- 4. Storage: restrict uploads in clan-banners and clan-logos to the user's own folder
DROP POLICY IF EXISTS "clan-banners authed write" ON storage.objects;
CREATE POLICY "clan-banners scoped insert"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'clan-banners'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "clan-logos authed write" ON storage.objects;
CREATE POLICY "clan-logos scoped insert"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'clan-logos'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

-- === 20260503150658_3b087113-5b69-4a75-bfb3-3eba5a5e26a5.sql ===
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_clan_owner(uuid, uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_clan_staff(uuid, uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_clan_moderator(uuid, uuid, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_clan_member(uuid, uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_community_admin(uuid, uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.can_post_news(uuid, uuid) TO anon, authenticated;

-- === 20260503152619_9a6b021c-cd4d-4242-a875-7fd357f76c1f.sql ===
-- Add FKs only if missing
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='clan_invites_clan_id_fkey') THEN
    ALTER TABLE public.clan_invites
      ADD CONSTRAINT clan_invites_clan_id_fkey
      FOREIGN KEY (clan_id) REFERENCES public.clans(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='clan_invites_invited_player_id_fkey') THEN
    ALTER TABLE public.clan_invites
      ADD CONSTRAINT clan_invites_invited_player_id_fkey
      FOREIGN KEY (invited_player_id) REFERENCES public.players(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='clan_join_requests_clan_id_fkey') THEN
    ALTER TABLE public.clan_join_requests
      ADD CONSTRAINT clan_join_requests_clan_id_fkey
      FOREIGN KEY (clan_id) REFERENCES public.clans(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='clan_join_requests_player_id_fkey') THEN
    ALTER TABLE public.clan_join_requests
      ADD CONSTRAINT clan_join_requests_player_id_fkey
      FOREIGN KEY (player_id) REFERENCES public.players(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Helpful indexes for the FKs
CREATE INDEX IF NOT EXISTS clan_invites_clan_id_idx ON public.clan_invites(clan_id);
CREATE INDEX IF NOT EXISTS clan_invites_player_id_idx ON public.clan_invites(invited_player_id);
CREATE INDEX IF NOT EXISTS clan_join_requests_clan_id_idx ON public.clan_join_requests(clan_id);
CREATE INDEX IF NOT EXISTS clan_join_requests_player_id_idx ON public.clan_join_requests(player_id);

-- === 20260503152704_3d2c3513-df15-42ff-b0d5-d24231cb181b.sql ===
NOTIFY pgrst, 'reload schema';

