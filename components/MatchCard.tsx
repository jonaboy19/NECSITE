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
 return(
  <div className='kaf-card rounded-2xl border border-white/10 p-4'>
   <div className='mb-3 flex items-center justify-between gap-3'>
    <div className='text-xs uppercase tracking-widest text-cyan-200'>Round {m.round} • Match {m.match_number}</div>
    <div className='rounded-full bg-slate-800 px-2 py-1 text-xs text-slate-300'>{m.status}</div>
   </div>
   <div className='grid grid-cols-[1fr_auto_1fr] items-center gap-3'>
    <div className='truncate text-sm font-bold'>{a}</div>
    <div className='rounded-lg bg-black/40 px-3 py-2 text-center text-sm font-black text-cyan-200'>{score}</div>
    <div className='truncate text-right text-sm font-bold'>{b}</div>
   </div>
   <ReportScore id={m.id}/>
   <MatchActions id={m.id}/>
  </div>
 )
}
