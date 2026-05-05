import { createServerSupabaseClient } from '@/lib/supabase/server'
import Link from 'next/link'
import PageLayout from '@/components/PageLayout'

export default async function Tournaments(){
 const supabase=await createServerSupabaseClient()
 const {data}=await supabase.from('tournament_summary').select('*').order('created_at',{ascending:false})
 return(
  <PageLayout>
   <div className="space-y-6">
    <h1 className="text-3xl font-bold">Tournaments</h1>
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
     {data?.map(t=>(
      <Link key={t.id} href={`/tournaments/${t.id}/dashboard`}>
       <div className="kaf-card p-6 rounded-2xl hover:border-cyan-300/40 transition">
        <div className="font-semibold text-lg">{t.title}</div>
        <div className="text-sm text-slate-400 mt-2">{t.registration_count} players • {t.match_count} matches</div>
       </div>
      </Link>
     ))}
    </div>
   </div>
  </PageLayout>
 )
}
