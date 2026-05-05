import { createServerSupabaseClient } from '@/lib/supabase/server'

export default async function Profile(){
 const supabase=await createServerSupabaseClient()
 const {data:user}=await supabase.auth.getUser()
 if(!user.user) return <main className='p-6'>Not logged in</main>
 const {data}=await supabase.from('profiles').select('*').eq('id',user.user.id).single()
 return <main className='p-6'><h1>{data?.username}</h1><p>{data?.display_name}</p></main>
}
