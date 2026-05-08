import { createServerSupabaseClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { BracketViewer } from '@/components/BracketViewer'
import { StatusBadge } from '@/components/StatusBadge'
import Link from 'next/link'
import { ArrowLeft, Trophy } from 'lucide-react'

export default async function BracketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()

  const { data: tournament } = await supabase.from('tournaments').select('*').eq('id', id).single()
  if (!tournament) notFound()

  const { data: matches } = await supabase
    .from('matches')
    .select('id,round,match_index,participant_a_id,participant_b_id,score_a,score_b,winner_id,status,scheduled_at,clan_a_id,clan_b_id,winner_clan_id')
    .eq('tournament_id', id)
    .order('round').order('match_index')

  // Build participant map from clan data
  const clanIds = [...new Set([
    ...(matches ?? []).map((m: any) => m.clan_a_id).filter(Boolean),
    ...(matches ?? []).map((m: any) => m.clan_b_id).filter(Boolean),
  ])]

  const { data: clans } = clanIds.length
    ? await supabase.from('clans').select('id,name,tag,logo_url').in('id', clanIds)
    : { data: [] }

  // Map matches to BracketViewer format
  const bracketMatches = (matches ?? []).map((m: any) => ({
    id: m.id,
    round: m.round ?? 1,
    match_index: m.match_index ?? 0,
    participant_a_id: m.clan_a_id,
    participant_b_id: m.clan_b_id,
    score_a: m.score_a,
    score_b: m.score_b,
    winner_id: m.winner_clan_id,
    status: m.status,
    scheduled_at: m.scheduled_at,
  }))

  const participants: Record<string, any> = {}
  ;(clans ?? []).forEach((c: any) => {
    participants[c.id] = { id: c.id, display_name: c.name, tag: c.tag, logo_url: c.logo_url }
  })

  return (
    <div className="flex flex-col w-full pb-24">
      {/* Header */}
      <div className="border-b border-kaf-border px-4 sm:px-8 py-6 bg-kaf-panel">
        <Link href={`/tournaments/${id}`} className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-brand-cyan mb-3 transition-colors font-mono uppercase tracking-widest">
          <ArrowLeft size={12} /> {tournament.title}
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-display font-black text-white uppercase flex items-center gap-3">
            <Trophy size={24} className="text-brand-gold" /> Tournament Bracket
          </h1>
          <StatusBadge status={tournament.status} />
        </div>
        <p className="text-slate-400 text-sm mt-1">{tournament.format || 'Single Elimination'} · {bracketMatches.length} matches</p>
      </div>

      <div className="p-4 sm:p-8">
        <BracketViewer
          matches={bracketMatches}
          participants={participants}
          label={tournament.title}
        />
        {bracketMatches.length === 0 && (
          <div className="text-center py-16 text-slate-500 text-sm">
            Bracket will appear here once the tournament has started.
          </div>
        )}
      </div>
    </div>
  )
}
