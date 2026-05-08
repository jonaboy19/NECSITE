import { createServerSupabaseClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function Tournament({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()
  const { data: tournament } = await supabase.from('tournaments').select('*').eq('id', id).single()
  const { data: players } = await supabase.from('tournament_registrations').select('*').eq('tournament_id', id)

  return (
    <main className='p-6 space-y-6'>
      <h1 className='text-2xl font-bold'>{tournament?.title}</h1>
      <Link href={`/tournaments/${id}/dashboard`} className="text-brand-cyan font-bold hover:underline">View Dashboard</Link>
      <Link href={`/tournaments/${id}/join`} className="ml-4 text-brand-cyan font-bold hover:underline">Join</Link>
      <div>
        <h2>Players</h2>
        {players?.map(p => (<div key={p.id}>{p.profile_id}</div>))}
      </div>
    </main>
  )
}
