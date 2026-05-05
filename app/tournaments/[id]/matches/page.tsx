import { createServerSupabaseClient } from '@/lib/supabase/server'

export default async function Matches({params}:{params:{id:string}}){
 const supabase=await createServerSupabaseClient()
 const {data}=await supabase.from('matches').select('*').eq('tournament_id',params.id)

 return(
  <main className='p-6'>
   <h1>Matches</h1>
   {data?.map(m=>(
    <div key={m.id}>
     {m.player_a_id} vs {m.player_b_id} - {m.score_a}:{m.score_b}
    </div>
   ))}
  </main>
 )
}
