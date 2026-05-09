'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AdminActionButton({label, rpc, args, danger=false}:{label:string; rpc:string; args?:any; danger?:boolean}){
 const supabase=createClient()
 const [loading,setLoading]=useState(false)
 const run=async()=>{
  setLoading(true)
  const {error}=await supabase.rpc(rpc,args||{})
  setLoading(false)
  if(error) return alert(error.message)
  alert('Done')
  window.location.reload()
 }
 return <button onClick={run} disabled={loading} className={`rounded-lg px-3 py-2 text-xs font-black ${danger?'bg-red-500 text-white':'bg-brand-cyan text-white hover:bg-brand-lime'} disabled:opacity-60`}>{loading?'...':label}</button>
}
