-- ================================================================
-- KAFConnect Schema Fix Migration
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/unoskdcuqdaaxiuymhcn/sql/new
-- ================================================================

-- ============ 1. PROFILES TABLE COLUMNS ============
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role text DEFAULT 'user';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS discord_id text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS twitch_username text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS region text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url text;

-- Make username unique (ignore if already exists)
DO $$ BEGIN
  ALTER TABLE public.profiles ADD CONSTRAINT profiles_username_unique UNIQUE (username);
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- ============ 2. USER_ROLES TABLE ============
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'user',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- ============ 3. ROLE HELPER FUNCTIONS ============
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id=_user_id AND role::text=_role)
$$;

CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id=_user_id AND role IN ('tournament_admin','super_admin'))
$$;

-- ============ 4. USER_ROLES RLS POLICIES ============
DO $$ BEGIN
  CREATE POLICY "roles read own" ON public.user_roles FOR SELECT
    USING (auth.uid() = user_id OR public.has_role(auth.uid(),'super_admin'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "roles admin all" ON public.user_roles FOR ALL
    USING (public.has_role(auth.uid(),'super_admin'))
    WITH CHECK (public.has_role(auth.uid(),'super_admin'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============ 5. AUTO-ASSIGN ROLE ON SIGNUP ============
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user') ON CONFLICT DO NOTHING;
  -- Also ensure profile row exists
  INSERT INTO public.profiles (id, username, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email,'@',1)),
    'user'
  ) ON CONFLICT (id) DO UPDATE
    SET username = COALESCE(profiles.username, EXCLUDED.username),
        role = COALESCE(profiles.role, 'user');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_role ON auth.users;
CREATE TRIGGER on_auth_user_role AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();

-- ============ 6. CLAN_APPLICATIONS TABLE ============
CREATE TABLE IF NOT EXISTS public.clan_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clan_id uuid NOT NULL REFERENCES public.clans(id) ON DELETE CASCADE,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending',
  message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(clan_id, profile_id)
);
ALTER TABLE public.clan_applications ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "clan_apps public read" ON public.clan_applications FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "clan_apps self insert" ON public.clan_applications FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = profile_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "clan_apps captain update" ON public.clan_applications FOR UPDATE
    USING (
      EXISTS(SELECT 1 FROM public.clans c WHERE c.id = clan_id AND c.captain_profile_id = auth.uid())
      OR public.is_admin(auth.uid())
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============ 7. FIX CLAN_MEMBERS - ADD profile_id + role ============
ALTER TABLE public.clan_members ADD COLUMN IF NOT EXISTS profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.clan_members ADD COLUMN IF NOT EXISTS role text DEFAULT 'player';

-- RLS on clan_members
ALTER TABLE public.clan_members ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "clan_members public read" ON public.clan_members FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "clan_members insert auth" ON public.clan_members FOR INSERT TO authenticated WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "clan_members captain update" ON public.clan_members FOR UPDATE
    USING (
      EXISTS(SELECT 1 FROM public.clans c WHERE c.id = clan_id AND c.captain_profile_id = auth.uid())
      OR public.is_admin(auth.uid())
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "clan_members captain delete" ON public.clan_members FOR DELETE
    USING (
      EXISTS(SELECT 1 FROM public.clans c WHERE c.id = clan_id AND c.captain_profile_id = auth.uid())
      OR profile_id = auth.uid()
      OR public.is_admin(auth.uid())
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============ 8. CLANS RLS ============
ALTER TABLE public.clans ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "clans public read" ON public.clans FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "clans insert authed" ON public.clans FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "clans captain update" ON public.clans FOR UPDATE
    USING (auth.uid() = captain_profile_id OR public.is_admin(auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "clans admin delete" ON public.clans FOR DELETE
    USING (public.has_role(auth.uid(),'super_admin'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============ 9. PROFILES RLS ============
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "profiles public read" ON public.profiles FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "profiles self insert" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "profiles self update" ON public.profiles FOR UPDATE USING (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============ 10. MATCHES / TOURNAMENTS / RANKINGS RLS ============
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "matches public read" ON public.matches FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "matches admin write" ON public.matches FOR ALL
    USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "tournaments public read" ON public.tournaments FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "tournaments admin write" ON public.tournaments FOR ALL
    USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============ 11. DISPUTES RLS ============
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "disputes public read" ON public.disputes FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "disputes insert authed" ON public.disputes FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = opened_by);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "disputes admin update" ON public.disputes FOR UPDATE
    USING (public.is_admin(auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============ 12. GRANT API ACCESS ============
GRANT SELECT ON public.user_roles TO anon, authenticated;
GRANT ALL ON public.clan_applications TO authenticated;
GRANT ALL ON public.clan_members TO authenticated;
GRANT SELECT ON public.clans TO anon, authenticated;
GRANT ALL ON public.clans TO authenticated;
GRANT SELECT ON public.profiles TO anon, authenticated;
GRANT UPDATE ON public.profiles TO authenticated;
GRANT INSERT ON public.profiles TO authenticated;
GRANT SELECT ON public.matches TO anon, authenticated;
GRANT SELECT ON public.tournaments TO anon, authenticated;
GRANT SELECT ON public.tournament_registrations TO anon, authenticated;
GRANT ALL ON public.tournament_registrations TO authenticated;
GRANT ALL ON public.disputes TO authenticated;

-- ============ 13. ADMIN OVERVIEW VIEW ============
DROP VIEW IF EXISTS public.admin_overview;
CREATE VIEW public.admin_overview WITH (security_invoker = true) AS
SELECT
  (SELECT COUNT(*)::int FROM public.tournaments) AS tournaments,
  (SELECT COUNT(*)::int FROM public.clans) AS clans,
  (SELECT COUNT(*)::int FROM public.profiles) AS players,
  (SELECT COUNT(*)::int FROM public.matches) AS matches,
  (SELECT COUNT(*)::int FROM public.tournament_registrations WHERE status = 'pending') AS pending_registrations,
  (SELECT COUNT(*)::int FROM public.disputes WHERE status = 'open') AS open_disputes;

GRANT SELECT ON public.admin_overview TO authenticated;

-- ============ 14. STORAGE BUCKETS ============
INSERT INTO storage.buckets (id, name, public) VALUES
  ('avatars','avatars',true),
  ('clan-logos','clan-logos',true),
  ('tournament-banners','tournament-banners',true),
  ('match-evidence','match-evidence',false)
ON CONFLICT (id) DO NOTHING;

DO $$ BEGIN
  CREATE POLICY "storage public read" ON storage.objects FOR SELECT
    USING (bucket_id IN ('avatars','clan-logos','tournament-banners'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "storage auth insert" ON storage.objects FOR INSERT TO authenticated
    WITH CHECK (bucket_id IN ('avatars','clan-logos','tournament-banners'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

SELECT 'KAFConnect schema setup complete!' AS result;
