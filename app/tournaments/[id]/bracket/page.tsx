import { createServerSupabaseClient } from '@/lib/supabase/server'

export default async function Bracket({params}:{params:{id:string}}){
 const supabase=await createServerSupabaseClient()
 const {data}=await supabase.from('matches').select('*').eq('tournament_id',params.id).order('round')

 const rounds = {} as any
 data?.forEach(m=>{
  if(!rounds[m.round]) rounds[m.round]=[]
  rounds[m.round].push(m)
 })

 return(
  <main className='p-6'>
   <h1>Bracket</h1>
   {Object.keys(rounds).map(r=> (
    <div key={r}>
     <h2>Round {r}</h2>
     {rounds[r].map((m:any)=>(
      <div key={m.id}>{m.player_a_id} vs {m.player_b_id}</div>
     ))}
    </div>
   ))}
  </main>
 )
}
