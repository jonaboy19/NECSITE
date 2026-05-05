import { createServerSupabaseClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function Tournaments(){
 const supabase=await createServerSupabaseClient()
 const {data}=await supabase.from('tournament_summary').select('*').order('created_at',{ascending:false})
 return(
  <main className='p-4 space-y-4'>
   <h1 className='text-xl font-bold'>Tournaments</h1>
   {data?.map(t=>(
    <Link key={t.id} href={`/tournaments/${t.id}/dashboard`}>
     <div className='kaf-card p-3 rounded'>
      <div className='font-semibold'>{t.title}</div>
      <div className='text-xs text-slate-400'>{t.registration_count} players • {t.match_count} matches</div>
     </div>
    </Link>
   ))}
  </main>
 )
}
