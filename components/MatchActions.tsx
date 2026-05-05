'use client'
import { createClient } from '@/lib/supabase/client'

export default function MatchActions({id}:{id:string}){
 const supabase=createClient()
 const confirm=async()=>{await supabase.rpc('confirm_match_result',{p_match_id:id});alert('confirmed')}
 return(
  <div className='flex gap-2 mt-2'>
   <button className='bg-green-500 px-2 py-1 text-xs' onClick={confirm}>Confirm</button>
  </div>
 )
}
