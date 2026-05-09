'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/Toast'

export default function MatchActions({id}:{id:string}){
 const supabase=createClient()
 const toast = useToast()
 const [loading, setLoading] = useState(false)
 const [confirmed, setConfirmed] = useState(false)
 const confirm=async()=>{
  setLoading(true)
  const { error } = await supabase.rpc('confirm_match_result',{p_match_id:id})
  setLoading(false)
  if (error) {
   toast.error(error.message)
   return
  }
  setConfirmed(true)
  toast.success('Match result confirmed.')
 }
 return(
  <div className='flex gap-2 mt-2'>
   <button disabled={loading || confirmed} className='rounded-lg bg-green-500 px-3 py-2 text-xs font-black text-white transition-colors hover:bg-green-400 disabled:opacity-60' onClick={confirm}>{confirmed ? 'Confirmed' : loading ? 'Confirming...' : 'Confirm'}</button>
  </div>
 )
}
