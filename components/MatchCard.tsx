import MatchActions from './MatchActions'
import ReportScore from './ReportScore'
export default function MatchCard({m}:{m:any}){
 return(
  <div className='kaf-card p-3 rounded-xl flex flex-col gap-1'>
   <div className='text-sm'>{m.player_a_username||m.player_a_id}</div>
   <div className='text-xs text-slate-400'>vs</div>
   <div className='text-sm'>{m.player_b_username||m.player_b_id}</div>
   <div className='text-xs mt-1'>{m.score_a}:{m.score_b}</div>
   <ReportScore id={m.id}/>
   <MatchActions id={m.id}/>
  </div>
 )
}
