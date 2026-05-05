'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function Confirm(){
 const supabase=createClient()
 const [id,setId]=useState('')
 const confirm=async()=>{
  await supabase.rpc('confirm_match_result',{p_match_id:id})
  alert('confirmed')
 }
 return <main className='p-6'><h1>Confirm Match</h1><input value={id} onChange={e=>setId(e.target.value)} placeholder='match id'/><button onClick={confirm}>Confirm</button></main>
}
