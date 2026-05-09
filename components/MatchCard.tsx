import MatchActions from './MatchActions'
import ReportScore from './ReportScore'

function nameFor(m:any, side:'a'|'b'){
 const player = side === 'a' ? (m.player_a_username || m.player_a_id) : (m.player_b_username || m.player_b_id)
 const clan = side === 'a' ? (m.clan_a_name || m.clan_a_id) : (m.clan_b_name || m.clan_b_id)
 return player || clan || 'TBD'
}

export default function MatchCard({m}:{m:any}){
 const a = nameFor(m,'a')
 const b = nameFor(m,'b')
 const score = m.score_a !== null && m.score_b !== null ? `${m.score_a} - ${m.score_b}` : 'Not reported'
 const isLive = m.status === 'live'
 const isCompleted = m.status === 'completed'
 return(
  <div className='depth-panel depth-hover rounded-2xl p-4 overflow-hidden'>
   <div className={`absolute inset-x-0 top-0 h-1 ${isLive ? 'bg-status-live' : isCompleted ? 'bg-brand-gold' : 'bg-brand-cyan/50'}`}></div>
   <div className='mb-3 flex items-center justify-between gap-3'>
    <div className='text-xs uppercase tracking-widest text-brand-cyan'>Round {m.round} - Match {m.match_number}</div>
    <div className={`rounded-full border px-2 py-1 text-xs font-black uppercase tracking-widest ${isLive ? 'border-status-live/30 bg-status-live/15 text-status-live' : isCompleted ? 'border-brand-gold/30 bg-brand-gold/10 text-brand-gold' : 'border-slate-700 bg-slate-800 text-slate-300'}`}>{m.status}</div>
   </div>
   <div className='grid grid-cols-[1fr_auto_1fr] items-center gap-3'>
    <div className='truncate rounded-xl border border-white/5 bg-black/20 px-3 py-3 text-sm font-bold'>{a}</div>
    <div className='rounded-xl border border-brand-cyan/20 bg-brand-cyan/10 px-3 py-2 text-center text-sm font-black text-brand-lime shadow-[0_0_18px_rgba(25,133,59,0.14)]'>{score}</div>
    <div className='truncate rounded-xl border border-white/5 bg-black/20 px-3 py-3 text-right text-sm font-bold'>{b}</div>
   </div>
   <ReportScore id={m.id}/>
   <MatchActions id={m.id}/>
  </div>
 )
}
