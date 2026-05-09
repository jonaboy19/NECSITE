-- Prevent arbitrary authenticated users from inserting themselves or others into
-- clan rosters. Membership writes should go through clan leadership, platform
-- admins, or the existing SECURITY DEFINER invitation/request RPC flows.

drop policy if exists "clan_members insert auth" on public.clan_members;

create policy "clan_members leader insert"
on public.clan_members
for insert
to authenticated
with check (
  public.is_admin(auth.uid())
  or exists (
    select 1
    from public.clans c
    where c.id = clan_id
      and (
        c.captain_profile_id = auth.uid()
        or c.owner_profile_id = auth.uid()
      )
  )
);
