import { createServerSupabaseClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { StatusBadge } from '@/components/StatusBadge'
import Link from 'next/link'
import { ArrowLeft, Swords, Calendar, Filter } from 'lucide-react'

export default async function TournamentMatchesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()

  const { data: tournament } = await supabase.from('tournaments').select('title,status').eq('id', id).single()
  if (!tournament) notFound()

  const { data: matches } = await supabase
    .from('matches')
    .select('id,round,match_index,status,score_a,score_b,scheduled_at,clan_a_id,clan_b_id,winner_clan_id')
    .eq('tournament_id', id)
    .order('round').order('match_index')

  const clanIds = [...new Set([
    ...(matches ?? []).map((m: any) => m.clan_a_id).filter(Boolean),
    ...(matches ?? []).map((m: any) => m.clan_b_id).filter(Boolean),
  ])]
  const { data: clans } = clanIds.length
    ? await supabase.from('clans').select('id,name,tag').in('id', clanIds)
    : { data: [] }

  const clanMap: Record<string, any> = {}
  ;(clans ?? []).forEach((c: any) => { clanMap[c.id] = c })

  const byRound: Record<number, any[]> = {}
  ;(matches ?? []).forEach((m: any) => { (byRound[m.round] ||= []).push(m) })

  return (
    <div className="flex flex-col w-full pb-24">
      <div className="relative overflow-hidden border-b border-kaf-border px-4 sm:px-8 py-6 bg-kaf-panel">
        <div className="absolute inset-0 bg-line-grid opacity-30"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-brand-cyan/10 via-transparent to-brand-blue/10"></div>
        <div className="relative z-10">
        <Link href={`/tournaments/${id}`} className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-brand-cyan mb-3 font-mono uppercase tracking-widest transition-colors">
          <ArrowLeft size={12} /> {tournament.title}
        </Link>
        <h1 className="text-2xl font-display font-black text-white uppercase flex items-center gap-2">
          <Swords size={20} className="text-brand-cyan" /> All Matches
        </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-6 space-y-8">
        {Object.keys(byRound).map(Number).sort((a, b) => a - b).map(round => (
          <div key={round}>
            <h2 className="text-xs font-mono uppercase tracking-widest text-brand-cyan mb-3 flex items-center gap-2">
              <div className="flex-1 h-px bg-brand-cyan/20" />
              Round {round}
              <div className="flex-1 h-px bg-brand-cyan/20" />
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {byRound[round].map((m: any) => {
                const cA = clanMap[m.clan_a_id]
                const cB = clanMap[m.clan_b_id]
                return (
                  <Link key={m.id} href={`/matches/${m.id}`}
                    className="depth-panel depth-hover rounded-2xl p-4 hover:border-brand-cyan/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <StatusBadge status={m.status} />
                      {m.scheduled_at && (
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Calendar size={10} /> {new Date(m.scheduled_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 text-sm font-bold text-white text-right truncate">{cA?.name || 'TBD'}</div>
                      <div className="rounded-xl border border-brand-cyan/20 bg-brand-cyan/10 px-3 py-1 font-mono font-black text-brand-lime text-sm shadow-[0_0_18px_rgba(25,133,59,0.14)]">
                        {m.score_a ?? '–'} : {m.score_b ?? '–'}
                      </div>
                      <div className="flex-1 text-sm font-bold text-white truncate">{cB?.name || 'TBD'}</div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
        {!matches?.length && (
          <div className="text-center py-16 text-slate-500">
            <Swords size={40} className="mx-auto mb-3 opacity-20" />
            <p className="text-sm">No matches yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
