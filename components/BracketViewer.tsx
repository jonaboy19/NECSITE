'use client'
import { Swords, Trophy, Clock, CheckCircle2 } from 'lucide-react'
import { StatusBadge } from '@/components/StatusBadge'

const CARD_W = 220
const CARD_H = 88
const GAP_X = 60

type Participant = { id: string; display_name: string; tag?: string; logo_url?: string | null }
type Match = {
  id: string; round: number; match_index: number
  participant_a_id?: string | null; participant_b_id?: string | null
  score_a?: number | null; score_b?: number | null
  winner_id?: string | null; status: string; scheduled_at?: string | null
}

function roundLabel(round: number, total: number) {
  const fromEnd = total - round + 1
  if (fromEnd === 1) return 'Final'
  if (fromEnd === 2) return 'Semifinal'
  if (fromEnd === 3) return 'Quarterfinal'
  return `Round ${round}`
}

function MatchCard({ m, byP, onClick }: { m: Match; byP: Record<string, Participant>; onClick?: () => void }) {
  const a = m.participant_a_id ? byP[m.participant_a_id] : null
  const b = m.participant_b_id ? byP[m.participant_b_id] : null
  const aWin = m.winner_id && m.winner_id === m.participant_a_id
  const bWin = m.winner_id && m.winner_id === m.participant_b_id
  const isLive = m.status === 'live' || m.status === 'in_progress'
  const isDone = m.status === 'completed' || m.status === 'finished'

  return (
    <button onClick={onClick} className={`depth-panel depth-hover w-full text-left rounded-xl overflow-hidden ${
      isLive ? 'border-red-500/50 shadow-md shadow-red-500/20' : isDone ? 'border-brand-cyan/30' : 'border-kaf-border hover:border-brand-cyan/40'
    }`}>
      <div className="px-2.5 py-1 text-[9px] font-mono uppercase tracking-widest text-slate-500 bg-slate-900/60 border-b border-kaf-border flex items-center justify-between">
        <span className="text-brand-cyan">M{m.match_index + 1}</span>
        <span className="flex items-center gap-1">
          {isLive && <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />}
          {isDone && <CheckCircle2 size={9} className="text-brand-cyan" />}
          {m.scheduled_at ? new Date(m.scheduled_at).toLocaleDateString([], { month: 'short', day: 'numeric' }) : m.status}
        </span>
      </div>
      {[{ p: a, score: m.score_a, win: !!aWin }, { p: b, score: m.score_b, win: !!bWin }].map((side, i) => (
        <div key={i} className={`flex items-center gap-2 px-2.5 py-2 ${side.win ? 'bg-brand-cyan/10' : (isDone && !side.win && side.p) ? 'opacity-50' : ''}`}>
          <div className="w-6 h-6 rounded bg-slate-800 border border-white/10 shadow-[0_8px_18px_rgba(0,0,0,0.28)] flex items-center justify-center overflow-hidden shrink-0">
            {side.p?.logo_url
              ? <img src={side.p.logo_url} alt="" className="w-full h-full object-cover" />
              : <Trophy size={10} className="text-slate-600" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className={`text-xs font-bold truncate ${side.win ? 'text-brand-cyan' : 'text-white'}`}>
              {side.p?.display_name || 'TBD'}
            </div>
            {side.p?.tag && <div className="text-[9px] text-slate-500">[{side.p.tag}]</div>}
          </div>
          <span className={`font-mono text-sm tabular-nums w-5 text-center ${side.win ? 'text-brand-cyan font-black' : 'text-slate-400'}`}>
            {side.score ?? '–'}
          </span>
        </div>
      ))}
    </button>
  )
}

function groupBy<T>(arr: T[], key: (t: T) => number): Record<number, T[]> {
  const out: Record<number, T[]> = {}
  arr.forEach(item => { const k = key(item); (out[k] ||= []).push(item) })
  return out
}

interface BracketViewerProps {
  matches: Match[]
  participants: Record<string, Participant>
  label?: string
  onMatchClick?: (m: Match) => void
}

export function BracketViewer({ matches, participants, label = 'Bracket', onMatchClick }: BracketViewerProps) {
  const rounds = groupBy(matches, m => m.round)
  const sortedRounds = Object.keys(rounds).map(Number).sort((a, b) => a - b)
  const maxFirstRound = rounds[sortedRounds[0]]?.length ?? 0
  const totalWidth = sortedRounds.length * (CARD_W + GAP_X)
  const totalHeight = Math.max(maxFirstRound, 1) * (CARD_H + 24) + 48

  if (!matches.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-500">
        <Swords size={40} className="mb-3 opacity-20" />
        <p className="text-sm">Bracket not generated yet.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <Swords size={14} className="text-brand-cyan" />
        <span className="text-xs font-mono uppercase tracking-widest text-slate-400">{label}</span>
        <div className="flex-1 h-px bg-gradient-to-r from-brand-cyan/30 via-kaf-border to-transparent" />
      </div>
      <div className="depth-panel rounded-2xl overflow-x-auto p-4 pb-6">
        <div className="relative" style={{ width: totalWidth, minHeight: totalHeight }}>
          {/* SVG connector lines */}
          <svg className="absolute inset-0 pointer-events-none" width={totalWidth} height={totalHeight}>
            {sortedRounds.slice(0, -1).map((rn, ri) => {
              const fromMatches = rounds[rn].sort((a, b) => a.match_index - b.match_index)
              const nextRound = rounds[sortedRounds[ri + 1]]
              const toCount = nextRound?.length ?? 0
              const fromCount = fromMatches.length
              const fromSpacing = totalHeight / fromCount
              const toSpacing = totalHeight / toCount
              return fromMatches.map((_, i) => {
                const fromX = ri * (CARD_W + GAP_X) + CARD_W
                const fromY = fromSpacing * i + fromSpacing / 2
                const toIdx = Math.floor(i / 2)
                const toX = (ri + 1) * (CARD_W + GAP_X)
                const toY = toSpacing * toIdx + toSpacing / 2
                const midX = fromX + GAP_X / 2
                return (
                  <path key={`${rn}-${i}`}
                    d={`M ${fromX} ${fromY} H ${midX} V ${toY} H ${toX}`}
                    stroke="rgba(34,197,94,0.32)" strokeWidth="1.8" fill="none" />
                )
              })
            })}
          </svg>

          {sortedRounds.map((rn, ri) => {
            const rMatches = rounds[rn].sort((a, b) => a.match_index - b.match_index)
            const spacing = totalHeight / rMatches.length
            return (
              <div key={rn} className="absolute top-0" style={{ left: ri * (CARD_W + GAP_X), width: CARD_W }}>
                <div className="text-[10px] font-mono uppercase tracking-widest text-brand-cyan mb-2 text-center">
                  {roundLabel(rn, sortedRounds.length)}
                </div>
                {rMatches.map((m, i) => (
                  <div key={m.id} className="absolute"
                    style={{ left: 0, width: CARD_W, top: spacing * i + spacing / 2 - CARD_H / 2 + 20 }}>
                    <MatchCard m={m} byP={participants} onClick={() => onMatchClick?.(m)} />
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
