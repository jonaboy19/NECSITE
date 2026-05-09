'use client'

import Link from 'next/link'
import { Trophy, Users, Play, Clock } from 'lucide-react'

type Match = {
  id: string
  round: number
  match_number?: number
  player_a?: { username: string; avatar_url?: string }
  player_b?: { username: string; avatar_url?: string }
  clan_a?: { name: string; logo_url?: string }
  clan_b?: { name: string; logo_url?: string }
  score_a?: number
  score_b?: number
  winner_id?: string
  status?: string
}

function MatchBox({ match, tournamentId }: { match: Match; tournamentId: string }) {
  const teamA = match.clan_a?.name || match.player_a?.username || 'TBD'
  const teamB = match.clan_b?.name || match.player_b?.username || 'TBD'
  const isLive = match.status === 'live'
  const isCompleted = match.status === 'completed'
  const hasTBD = teamA === 'TBD' || teamB === 'TBD'

  return (
    <Link
      href={`/matches/${match.id}`}
      className={`depth-panel depth-hover block w-52 rounded-xl group ${
        isLive
          ? 'border-status-live/60 bg-status-live/5 shadow-[0_0_15px_rgba(255,0,60,0.15)]'
          : 'border-kaf-border hover:border-brand-cyan/40'
      }`}
    >
      {/* Live badge */}
      {isLive && (
        <div className="px-2 py-0.5 bg-status-live text-white text-[9px] font-black uppercase tracking-widest flex items-center gap-1 rounded-t-xl">
          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> LIVE
        </div>
      )}

      {/* Team A */}
      <div className={`flex items-center justify-between px-3 py-2.5 ${isCompleted && match.score_a !== undefined && match.score_a > (match.score_b ?? 0) ? 'text-white' : 'text-slate-400'}`}>
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="w-6 h-6 rounded-full bg-slate-700 bg-cover bg-center shrink-0 border border-kaf-border"
            style={{ backgroundImage: match.player_a ? `url('https://api.dicebear.com/7.x/avataaars/svg?seed=${match.player_a.username}')` : undefined }}
          />
          <span className="text-sm font-bold truncate">{teamA}</span>
        </div>
        {isCompleted && <span className="text-sm font-black ml-2 shrink-0">{match.score_a ?? 0}</span>}
      </div>

      {/* Divider */}
      <div className="mx-3 h-px bg-kaf-border" />

      {/* Team B */}
      <div className={`flex items-center justify-between px-3 py-2.5 ${isCompleted && match.score_b !== undefined && match.score_b > (match.score_a ?? 0) ? 'text-white' : 'text-slate-400'}`}>
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="w-6 h-6 rounded-full bg-slate-700 bg-cover bg-center shrink-0 border border-kaf-border"
            style={{ backgroundImage: match.player_b ? `url('https://api.dicebear.com/7.x/avataaars/svg?seed=${match.player_b.username}')` : undefined }}
          />
          <span className="text-sm font-bold truncate">{teamB}</span>
        </div>
        {isCompleted && <span className="text-sm font-black ml-2 shrink-0">{match.score_b ?? 0}</span>}
      </div>

      {/* Footer */}
      {!isLive && !isCompleted && (
        <div className="px-3 pb-2 flex items-center gap-1 text-[10px] text-slate-600 font-bold uppercase tracking-widest">
          <Clock size={10} /> Upcoming
        </div>
      )}
    </Link>
  )
}

function EmptyMatchBox() {
  return (
    <div className="w-52 rounded-xl border border-dashed border-kaf-border/40 bg-kaf-panel/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <div className="px-3 py-2.5 flex items-center gap-2 text-slate-700">
        <div className="w-6 h-6 rounded-full bg-slate-800 shrink-0" />
        <span className="text-sm font-bold">TBD</span>
      </div>
      <div className="mx-3 h-px bg-kaf-border/40" />
      <div className="px-3 py-2.5 flex items-center gap-2 text-slate-700">
        <div className="w-6 h-6 rounded-full bg-slate-800 shrink-0" />
        <span className="text-sm font-bold">TBD</span>
      </div>
    </div>
  )
}

function getRoundLabel(round: number, maxRound: number): string {
  const fromEnd = maxRound - round
  if (fromEnd === 0) return 'Final'
  if (fromEnd === 1) return 'Semi-Final'
  if (fromEnd === 2) return 'Quarter-Final'
  if (fromEnd === 3) return 'Round of 16'
  if (fromEnd === 4) return 'Round of 32'
  return `Round ${round + 1}`
}

export default function BracketVisualizer({ matches, tournamentId }: { matches: Match[]; tournamentId: string }) {
  if (!matches || matches.length === 0) {
    return (
      <div className="py-16 flex flex-col items-center justify-center text-center">
        <Trophy size={48} className="text-slate-700 mb-4" />
        <h3 className="text-xl font-black text-white mb-2">Bracket Not Generated Yet</h3>
        <p className="text-slate-400 max-w-md">The bracket will appear here once the tournament host starts the event.</p>
      </div>
    )
  }

  // Group matches by round
  const rounds = matches.reduce<Record<number, Match[]>>((acc, m) => {
    const r = m.round ?? 0
    if (!acc[r]) acc[r] = []
    acc[r].push(m)
    return acc
  }, {})

  const roundKeys = Object.keys(rounds).map(Number).sort((a, b) => a - b)
  const maxRound = Math.max(...roundKeys)

  return (
    <div className="overflow-x-auto no-scrollbar pb-6">
      <div className="flex gap-8 min-w-max p-4">
        {roundKeys.map((round) => {
          const roundMatches = rounds[round]
          const label = getRoundLabel(round, maxRound)

          // Calculate how many matches there should be (for empty slot padding)
          const maxMatchesInFirstRound = rounds[roundKeys[0]].length
          const expectedMatchCount = Math.ceil(maxMatchesInFirstRound / Math.pow(2, round - roundKeys[0]))
          const emptySlots = Math.max(0, expectedMatchCount - roundMatches.length)

          return (
            <div key={round} className="flex flex-col">
              {/* Round Label */}
              <div className="text-center mb-4">
                <span className="text-[10px] font-black text-brand-cyan uppercase tracking-[0.2em] px-3 py-1 rounded-full bg-brand-cyan/10 border border-brand-cyan/20">
                  {label}
                </span>
              </div>

              {/* Matches stacked vertically with spacing */}
              <div
                className="flex flex-col justify-around flex-1"
                style={{ gap: `${Math.pow(2, round - roundKeys[0]) * 16}px` }}
              >
                {roundMatches.map(m => (
                  <MatchBox key={m.id} match={m} tournamentId={tournamentId} />
                ))}
                {Array.from({ length: emptySlots }).map((_, i) => (
                  <EmptyMatchBox key={`empty-${i}`} />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
