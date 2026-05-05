'use client'
import { createClient } from '@/lib/supabase/client'

export default function Admin(){
 const supabase=createClient()
 const start=async()=>{await supabase.from('tournaments').update({status:'live'})}
 return <main className='p-6'><h1>Admin</h1><button onClick={start}>Force Start</button></main>
}
