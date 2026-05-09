import { createServerSupabaseClient } from '@/lib/supabase/server'
import AdminActionButton from '@/components/AdminActionButton'

export default async function AdminMatches(){
 const supabase=await createServerSupabaseClient()
 const {data}=await supabase.from('matches').select('*').limit(20)

 return (
  <div className="p-6 space-y-4">
   <h1 className="text-2xl font-black">Match Control</h1>
   {data?.map(m=>(
    <div key={m.id} className="border border-white/10 p-4 rounded-xl flex flex-col gap-2">
     <div className="font-bold">{m.id}</div>
     <div>Status: {m.status}</div>
     <div className="flex gap-2">
      <AdminActionButton label="Reset" rpc="admin_reset_match" args={{p_match_id:m.id}} danger/>
      <AdminActionButton label="Confirm" rpc="admin_confirm_match" args={{p_match_id:m.id}}/>
     </div>
    </div>
   ))}
  </div>
 )
}
