import { createServerSupabaseClient } from '@/lib/supabase/server'
import PageLayout from '@/components/PageLayout'

export default async function Rankings(){
 const supabase=await createServerSupabaseClient()
 const {data}=await supabase.from('rankings').select('*').order('rating',{ascending:false}).limit(50)
 return (
  <PageLayout>
   <div className="space-y-6">
    <h1 className="text-3xl font-bold">Leaderboard</h1>
    <div className="kaf-card rounded-2xl p-6">
     <div className="space-y-4">
      {data?.map((r, index) => (
       <div key={r.id} className="flex items-center justify-between border-b border-slate-700 pb-4 last:border-b-0">
        <div className="flex items-center gap-4">
         <div className="text-2xl font-black text-cyan-200 w-8">#{index + 1}</div>
         <div>
          <div className="font-semibold">{r.profile_id}</div>
         </div>
        </div>
        <div className="text-lg font-bold text-cyan-200">{r.rating}</div>
       </div>
      ))}
     </div>
    </div>
   </div>
  </PageLayout>
 )
}
