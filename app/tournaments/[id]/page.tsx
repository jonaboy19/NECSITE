import { createServerSupabaseClient } from '@/lib/supabase/server'

export default async function Tournament({params}:{params:{id:string}}){
 const supabase=await createServerSupabaseClient()
 const {data:tournament}=await supabase.from('tournaments').select('*').eq('id',params.id).single()
 const {data:players}=await supabase.from('tournament_registrations').select('*').eq('tournament_id',params.id)

 return(
  <main className='p-6 space-y-6'>
   <h1 className='text-2xl font-bold'>{tournament?.title}</h1>
   <a href={`/tournaments/${params.id}/join`}>Join</a>
   <div>
    <h2>Players</h2>
    {players?.map(p=>(<div key={p.id}>{p.profile_id}</div>))}
   </div>
  </main>
 )
}
