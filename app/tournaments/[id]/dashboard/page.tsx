import { createServerSupabaseClient } from '@/lib/supabase/server'
import MatchCard from '@/components/MatchCard'

export default async function Dashboard({params}:{params:{id:string}}){
 const supabase=await createServerSupabaseClient()
 const {data:tournament}=await supabase.from('tournaments').select('*').eq('id',params.id).single()
 const {data:matches}=await supabase.from('match_details').select('*').eq('tournament_id',params.id)
 const {data:players}=await supabase.from('tournament_registrations').select('*').eq('tournament_id',params.id)

 return(
  <main className='p-4 space-y-4'>
   <h1 className='text-xl font-bold'>{tournament?.title}</h1>
   <div className='text-sm'>Players: {players?.length}</div>
   <div className='grid grid-cols-2 gap-2'>
    {matches?.map(m=>(<MatchCard key={m.id} m={m}/>))}
   </div>
  </main>
 )
}
