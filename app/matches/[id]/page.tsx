import { createServerSupabaseClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { StatusBadge } from '@/components/StatusBadge'
import Link from 'next/link'
import { ArrowLeft, Swords, Clock, Upload, Trophy } from 'lucide-react'
import DisputeUpload from '@/components/DisputeUpload'
import { MatchRoomChat } from '@/components/MatchRoomChat'

export default async function MatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()

  const { data: match } = await supabase
    .from('matches')
    .select('*')
    .eq('id', id)
    .single()

  if (!match) notFound()

  const [clanARes, clanBRes] = await Promise.all([
    match.clan_a_id ? supabase.from('clans').select('id,name,tag,logo_url').eq('id', match.clan_a_id).single() : { data: null },
    match.clan_b_id ? supabase.from('clans').select('id,name,tag,logo_url').eq('id', match.clan_b_id).single() : { data: null },
  ])

  const clanA = clanARes.data
  const clanB = clanBRes.data
  const isDone = match.status === 'completed' || match.status === 'finished'

  const ClubBox = ({ clan, score, isWinner }: { clan: any; score: any; isWinner: boolean }) => (
    <div className={`depth-panel flex-1 flex flex-col items-center gap-3 p-6 rounded-2xl transition-all ${isWinner ? 'border-brand-cyan/40 bg-brand-cyan/5' : ''}`}>
      {clan?.logo_url
        ? <img src={clan.logo_url} alt={clan?.name} className="w-16 h-16 rounded-2xl object-cover border border-kaf-border" />
        : <div className="w-16 h-16 rounded-2xl bg-brand-cyan/10 border border-brand-cyan/20 flex items-center justify-center text-2xl font-black text-brand-cyan">{clan?.name?.[0] || '?'}</div>
      }
      {clan?.tag && <div className="text-xs text-slate-500 font-mono">[{clan.tag}]</div>}
      <div className={`text-lg font-black ${isWinner ? 'text-brand-cyan' : 'text-white'}`}>{clan?.name || 'TBD'}</div>
      <div className={`text-5xl font-black tabular-nums ${isWinner ? 'text-brand-cyan' : 'text-white'}`}>
        {score ?? '–'}
      </div>
      {isWinner && <div className="flex items-center gap-1 text-brand-cyan text-xs font-black"><Trophy size={12} /> Winner</div>}
    </div>
  )

  return (
    <div className="flex flex-col w-full pb-24">
      <div className="relative overflow-hidden border-b border-kaf-border px-4 sm:px-8 py-6 bg-kaf-panel">
        <div className="absolute inset-0 bg-line-grid opacity-30"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-brand-cyan/10 via-transparent to-brand-blue/10"></div>
        <div className="relative z-10">
        {match.tournament_id && (
          <Link href={`/tournaments/${match.tournament_id}/matches`}
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-brand-cyan mb-3 font-mono uppercase tracking-widest transition-colors">
            <ArrowLeft size={12} /> Back to Matches
          </Link>
        )}
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-display font-black text-white uppercase flex items-center gap-2">
            <Swords size={20} className="text-brand-cyan" /> Match Room
          </h1>
          <StatusBadge status={match.status} />
        </div>
        {match.scheduled_at && (
          <div className="flex items-center gap-1.5 text-sm text-slate-400 mt-1">
            <Clock size={13} /> Scheduled: {new Date(match.scheduled_at).toLocaleString()}
          </div>
        )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 space-y-6">
        {/* Score display */}
        <div className="flex items-center gap-4">
          <ClubBox clan={clanA} score={match.score_a} isWinner={isDone && match.winner_clan_id === match.clan_a_id} />
          <div className="text-2xl font-black text-slate-600 shrink-0">VS</div>
          <ClubBox clan={clanB} score={match.score_b} isWinner={isDone && match.winner_clan_id === match.clan_b_id} />
        </div>

        {/* Match details */}
        <div className="depth-panel rounded-2xl p-5 space-y-2 text-sm">
          {match.round && <div className="flex justify-between"><span className="text-slate-400">Round</span><span className="font-bold text-white">{match.round}</span></div>}
          {match.format && <div className="flex justify-between"><span className="text-slate-400">Format</span><span className="font-bold text-white">{match.format}</span></div>}
          {match.evidence_url && (
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Evidence</span>
              <a href={match.evidence_url} target="_blank" rel="noopener noreferrer"
                className="text-brand-cyan hover:underline text-xs font-bold flex items-center gap-1">
                <Upload size={10} /> View
              </a>
            </div>
          )}
        </div>

        {/* Submit result link */}
        {!isDone && (
          <Link href={`/matches/report?match=${id}`}
            className="block w-full py-3 text-center bg-brand-cyan hover:bg-brand-lime text-white rounded-xl font-black transition-all shadow-glow-green hover:scale-[1.01]">
            Submit Match Result
          </Link>
        )}
        <MatchRoomChat matchId={id} />
        {!isDone && <DisputeUpload matchId={id} />}
      </div>
    </div>
  )
}
