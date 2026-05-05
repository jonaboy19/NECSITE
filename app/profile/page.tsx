import { createServerSupabaseClient } from '@/lib/supabase/server'
import PageLayout from '@/components/PageLayout'

export default async function Profile(){
 const supabase=await createServerSupabaseClient()
 const {data:user}=await supabase.auth.getUser()
 if(!user.user) return (
  <PageLayout>
   <div className="text-center">
    <h1 className="text-3xl font-bold mb-4">Not logged in</h1>
    <a href="/auth/login" className="rounded-2xl bg-cyan-400 px-6 py-3 font-bold text-slate-950">Login</a>
   </div>
  </PageLayout>
 )
 const {data}=await supabase.from('profiles').select('*').eq('id',user.user.id).single()
 return (
  <PageLayout>
   <div className="space-y-6">
    <h1 className="text-3xl font-bold">Profile</h1>
    <div className="kaf-card p-6 rounded-2xl">
     <div className="space-y-4">
      <div>
       <label className="text-sm text-slate-400">Username</label>
       <div className="text-lg font-semibold">{data?.username}</div>
      </div>
      <div>
       <label className="text-sm text-slate-400">Display Name</label>
       <div className="text-lg font-semibold">{data?.display_name}</div>
      </div>
     </div>
    </div>
   </div>
  </PageLayout>
 )
}
