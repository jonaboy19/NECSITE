import { createServerSupabaseClient } from '@/lib/supabase/server'
import MatchCard from '@/components/MatchCard'

export default async function Dashboard({params}:{params:{id:string}}){
 const supabase=await createServerSupabaseClient()

 const {data:tournament}=await supabase.from('tournaments').select('*').eq('id',params.id).single()
 const {data:matches}=await supabase.from('match_details').select('*').eq('tournament_id',params.id)
 const {data:players}=await supabase.from('tournament_registrations').select('*').eq('tournament_id',params.id)

 return(
  <main className='p-4 space-y-6'>
   <div className='space-y-2'>
    <h1 className='text-2xl font-black'>{tournament?.title}</h1>
    <div className='flex gap-4 text-sm text-slate-400'>
     <span>{players?.length || 0} players</span>
     <span>{matches?.length || 0} matches</span>
     <span className='uppercase'>{tournament?.status}</span>
    </div>
   </div>

   {/* Match Section */}
   <div className='space-y-3'>
    <h2 className='text-lg font-bold'>Matches</h2>
    <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
     {matches?.length===0 ? (
      <div className='text-slate-400'>No matches generated yet.</div>
     ) : matches.map(m=>(<MatchCard key={m.id} m={m}/>))}
    </div>
   </div>

   {/* Players Section */}
   <div className='space-y-3'>
    <h2 className='text-lg font-bold'>Participants</h2>
    <div className='grid gap-2 sm:grid-cols-2'>
     {players?.map(p=>(
      <div key={p.id} className='kaf-card p-3 rounded-xl'>
       {p.player_id}
      </div>
     ))}
    </div>
   </div>

  </main>
 )
}
