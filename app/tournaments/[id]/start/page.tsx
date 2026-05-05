'use client'
import { createClient } from '@/lib/supabase/client'

export default function StartTournament({params}:{params:{id:string}}){
 const supabase=createClient()
 const start=async()=>{
  const {error}=await supabase.rpc('generate_round_one_matches',{p_tournament_id:params.id})
  if(error)return alert(error.message)
  alert('tournament started & matches generated')
 }
 return <main className='p-6'><h1>Start Tournament</h1><button onClick={start}>Start</button></main>
}
