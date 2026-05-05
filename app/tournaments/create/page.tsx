'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { slugify } from '@/lib/slugify'
import PageLayout from '@/components/PageLayout'

export default function CreateTournament(){
 const supabase=createClient()
 const [title,setTitle]=useState('')
 const create=async()=>{
  const {data}=await supabase.auth.getUser()
  if(!data.user) return alert('login')
  await supabase.from('tournaments').insert({title,slug:slugify(title),host_id:data.user.id,status:'registration_open'})
  alert('done')
 }
 return(
  <PageLayout>
   <div className="space-y-6">
    <h1 className="text-3xl font-bold">Create Tournament</h1>
    <div className="kaf-card p-6 rounded-2xl max-w-md">
     <div className="space-y-4">
      <input
       value={title}
       onChange={e=>setTitle(e.target.value)}
       placeholder='Tournament Title'
       className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:border-cyan-400 focus:outline-none"
      />
      <button
       onClick={create}
       className="w-full rounded-lg bg-cyan-400 px-4 py-3 font-bold text-slate-950 hover:bg-cyan-300 transition"
      >
       Create Tournament
      </button>
     </div>
    </div>
   </div>
  </PageLayout>
 )
}
