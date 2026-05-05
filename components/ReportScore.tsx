'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ReportScore({id}:{id:string}){
 const supabase=createClient()
 const [a,setA]=useState('')
 const [b,setB]=useState('')
 const save=async()=>{await supabase.from('matches').update({score_a:Number(a),score_b:Number(b),status:'reported'}).eq('id',id);alert('score saved')}
 return <div className='flex gap-1 mt-2'><input className='w-10 bg-black border' value={a} onChange={e=>setA(e.target.value)}/><input className='w-10 bg-black border' value={b} onChange={e=>setB(e.target.value)}/><button className='text-xs bg-cyan-500 px-2' onClick={save}>Report</button></div>
}
