'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ReportMatch(){
 const supabase=createClient()
 const [matchId,setMatchId]=useState('')
 const [scoreA,setScoreA]=useState('')
 const [scoreB,setScoreB]=useState('')

 const report=async()=>{
  const {error}=await supabase.from('matches').update({score_a:Number(scoreA),score_b:Number(scoreB),status:'reported'}).eq('id',matchId)
  if(error)return alert(error.message)
  alert('reported')
 }

 return(
  <main className='p-6 space-y-4'>
   <h1>Report Match</h1>
   <input placeholder='match id' value={matchId} onChange={e=>setMatchId(e.target.value)}/>
   <input placeholder='score A' value={scoreA} onChange={e=>setScoreA(e.target.value)}/>
   <input placeholder='score B' value={scoreB} onChange={e=>setScoreB(e.target.value)}/>
   <button onClick={report}>Submit</button>
  </main>
 )
}
