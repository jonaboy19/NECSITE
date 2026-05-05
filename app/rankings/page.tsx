import { createServerSupabaseClient } from '@/lib/supabase/server'

export default async function Rankings(){
 const supabase=await createServerSupabaseClient()
 const {data}=await supabase.from('rankings').select('*').order('rating',{ascending:false}).limit(50)
 return <main className='p-6'><h1>Leaderboard</h1>{data?.map(r=>(<div key={r.id}>{r.profile_id} - {r.rating}</div>))}</main>
}
