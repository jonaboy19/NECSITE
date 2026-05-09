'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ReportScore({id}:{id:string}){
 const supabase=createClient()
 const [a,setA]=useState('')
 const [b,setB]=useState('')
 const [saving,setSaving]=useState(false)
 const save=async()=>{
  setSaving(true)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
   setSaving(false)
   return alert('Sign in to report a score')
  }
  const {error}=await supabase.from('match_results').insert({
   match_id:id,
   submitted_by:user.id,
   score_1:Number(a),
   score_2:Number(b),
   status:'pending'
  })
  setSaving(false)
  if(error)return alert(error.message)
  alert('score submitted for review')
 }
 return(
  <div className='mt-3 grid grid-cols-[1fr_1fr_auto] gap-2'>
   <input className='min-w-0 rounded-lg border border-slate-700 bg-black/40 px-2 py-2 text-center text-sm' placeholder='A' value={a} onChange={e=>setA(e.target.value)}/>
   <input className='min-w-0 rounded-lg border border-slate-700 bg-black/40 px-2 py-2 text-center text-sm' placeholder='B' value={b} onChange={e=>setB(e.target.value)}/>
   <button disabled={saving} className='rounded-lg bg-brand-cyan px-3 py-2 text-xs font-black text-white hover:bg-brand-lime disabled:opacity-60' onClick={save}>{saving?'...':'Report'}</button>
  </div>
 )
}
