import { createServerSupabaseClient } from '@/lib/supabase/server'

export default async function AdminDashboard(){
 const supabase=await createServerSupabaseClient()
 const {data}=await supabase.from('admin_overview').select('*').single()

 return (
  <div className="p-6 space-y-6">
   <h1 className="text-3xl font-black">Admin Dashboard</h1>
   <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    {Object.entries(data||{}).map(([k,v])=> (
     <div key={k} className="bg-black/40 border border-white/10 rounded-xl p-4">
      <div className="text-xs opacity-70">{k}</div>
      <div className="text-2xl font-black">{String(v)}</div>
     </div>
    ))}
   </div>
  </div>
 )
}
