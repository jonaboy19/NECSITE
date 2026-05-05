import { createServerSupabaseClient } from '@/lib/supabase/server'

export default async function Dashboard({params}:{params:{id:string}}){
 const supabase=await createServerSupabaseClient()
 const {data:tournament}=await supabase.from('tournaments').select('*').eq('id',params.id).single()
 const {data:matches}=await supabase.from('match_details').select('*').eq('tournament_id',params.id)
 const {data:players}=await supabase.from('tournament_registrations').select('*').eq('tournament_id',params.id)

 return(
  <main className='p-6 space-y-6'>
   <h1 className='text-2xl font-bold'>{tournament?.title}</h1>
   <div>Players: {players?.length}</div>
   <div>Matches: {matches?.length}</div>
   <div>
    {matches?.map(m=>(<div key={m.id}>{m.player_a_username} vs {m.player_b_username}</div>))}
   </div>
  </main>
 )
}
