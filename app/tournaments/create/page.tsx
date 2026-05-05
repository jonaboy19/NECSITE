'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { slugify } from '@/lib/slugify'

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
  <div className='p-6'>
   <h1>Create Tournament</h1>
   <input value={title} onChange={e=>setTitle(e.target.value)} placeholder='title'/>
   <button onClick={create}>create</button>
  </div>
 )
}
