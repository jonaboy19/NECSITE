'use client'
import { use } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function JoinTournament({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const supabase = createClient()
  const join = async () => {
    const { data } = await supabase.auth.getUser()
    if (!data.user) return alert('login first')
    const { error } = await supabase.from('tournament_registrations').insert({ tournament_id: id, profile_id: data.user.id, status: 'pending' })
    if (error) return alert(error.message)
    alert('registration sent')
  }
  return <main className='p-6'><h1>Join Tournament</h1><button onClick={join}>Join as Player</button></main>
}
