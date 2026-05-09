import type { SupabaseClient } from '@supabase/supabase-js'

export type ClanPermission =
  | 'view_private_hq'
  | 'manage_roster'
  | 'manage_contracts'
  | 'manage_transfers'
  | 'manage_tactics'
  | 'manage_media'
  | 'moderate_chat'

export type TournamentPermission =
  | 'manage_tournament'
  | 'manage_matches'
  | 'resolve_disputes'
  | 'manage_broadcasts'
  | 'manage_checkins'

const CLAN_ROLE_PERMISSIONS: Record<string, ClanPermission[]> = {
  owner: ['view_private_hq', 'manage_roster', 'manage_contracts', 'manage_transfers', 'manage_tactics', 'manage_media', 'moderate_chat'],
  manager: ['view_private_hq', 'manage_roster', 'manage_contracts', 'manage_transfers', 'manage_tactics', 'manage_media', 'moderate_chat'],
  captain: ['view_private_hq', 'manage_roster', 'manage_transfers', 'manage_tactics', 'moderate_chat'],
  co_captain: ['view_private_hq', 'manage_roster', 'manage_tactics', 'moderate_chat'],
  coach: ['view_private_hq', 'manage_tactics'],
  analyst: ['view_private_hq', 'manage_tactics'],
  player: ['view_private_hq'],
  sub: ['view_private_hq'],
}

export function getClanPermissions(role?: string | null): ClanPermission[] {
  return CLAN_ROLE_PERMISSIONS[role || 'player'] || CLAN_ROLE_PERMISSIONS.player
}

export function hasClanPermission(role: string | null | undefined, permission: ClanPermission) {
  return getClanPermissions(role).includes(permission)
}

export async function canManageTournament(supabase: SupabaseClient, userId: string, tournamentId: string) {
  const [{ data: tournament }, { data: adminRole }, { data: profile }] = await Promise.all([
    supabase.from('tournaments').select('created_by,host_id').eq('id', tournamentId).maybeSingle(),
    supabase.from('tournament_admins').select('role').eq('tournament_id', tournamentId).eq('profile_id', userId).maybeSingle(),
    supabase.from('profiles').select('role').eq('id', userId).maybeSingle(),
  ])

  const platformRoles = ['admin', 'super_admin', 'moderator']
  return Boolean(
    tournament?.created_by === userId ||
    tournament?.host_id === userId ||
    adminRole ||
    platformRoles.includes(profile?.role)
  )
}
