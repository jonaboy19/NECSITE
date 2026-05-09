alter table public.tournament_registrations enable row level security;

drop policy if exists "treg insert authed" on public.tournament_registrations;
drop policy if exists "treg insert self or clan member" on public.tournament_registrations;

create policy "treg insert self or clan member"
  on public.tournament_registrations
  for insert
  to authenticated
  with check (
    auth.uid() = submitted_by
    and (
      clan_id is null
      or exists (
        select 1
        from public.clan_members cm
        where cm.clan_id = tournament_registrations.clan_id
          and cm.profile_id = auth.uid()
      )
      or exists (
        select 1
        from public.clans c
        where c.id = tournament_registrations.clan_id
          and c.captain_profile_id = auth.uid()
      )
      or public.is_admin(auth.uid())
    )
  );

grant select on public.tournament_registrations to anon, authenticated;
grant insert on public.tournament_registrations to authenticated;

alter table public.match_results enable row level security;

drop policy if exists "mres insert authed" on public.match_results;
drop policy if exists "mres insert own report" on public.match_results;

create policy "mres insert own report"
  on public.match_results
  for insert
  to authenticated
  with check (auth.uid() = submitted_by);

grant select on public.match_results to anon, authenticated;
grant insert on public.match_results to authenticated;

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update set public = true;

drop policy if exists "storage auth insert" on storage.objects;
drop policy if exists "avatars scoped insert" on storage.objects;
drop policy if exists "avatars scoped update" on storage.objects;
drop policy if exists "avatars scoped delete" on storage.objects;

create policy "avatars scoped insert"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "avatars scoped update"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  )
  with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "avatars scoped delete"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
