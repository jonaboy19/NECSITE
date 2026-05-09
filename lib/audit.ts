import type { SupabaseClient } from '@supabase/supabase-js'

type AuditInput = {
  actorId: string
  action: string
  entityType: string
  entityId?: string | null
  clanId?: string | null
  tournamentId?: string | null
  matchId?: string | null
  metadata?: Record<string, unknown>
}

type ActivityInput = {
  actorId?: string | null
  eventType: string
  title: string
  body?: string | null
  link?: string | null
  visibility?: 'public' | 'private' | 'clan' | 'admin'
  clanId?: string | null
  tournamentId?: string | null
  playerId?: string | null
  metadata?: Record<string, unknown>
}

export async function recordAuditEvent(supabase: SupabaseClient, input: AuditInput) {
  return supabase.from('platform_audit_events').insert({
    actor_id: input.actorId,
    action: input.action,
    entity_type: input.entityType,
    entity_id: input.entityId || null,
    clan_id: input.clanId || null,
    tournament_id: input.tournamentId || null,
    match_id: input.matchId || null,
    metadata: input.metadata || {},
  })
}

export async function recordActivityEvent(supabase: SupabaseClient, input: ActivityInput) {
  return supabase.from('activity_events').insert({
    actor_id: input.actorId || null,
    event_type: input.eventType,
    title: input.title,
    body: input.body || null,
    link: input.link || null,
    visibility: input.visibility || 'public',
    clan_id: input.clanId || null,
    tournament_id: input.tournamentId || null,
    player_id: input.playerId || null,
    metadata: input.metadata || {},
  })
}
