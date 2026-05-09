'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Loader2, Zap, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useToast } from '@/components/Toast'

export default function TournamentStartPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const router = useRouter()
  const { success, error: toastError } = useToast()
  const [starting, setStarting] = useState(false)

  const start = async () => {
    setStarting(true)
    const { error } = await supabase.from('tournaments').update({ status: 'live' }).eq('id', params.id)
    if (error) { toastError(error.message); setStarting(false); return }

    // Generate first round matches via RPC if available
    try {
      await supabase.rpc('generate_round_one_matches', { _tournament_id: params.id })
    } catch {}

    success('Tournament started! Bracket is live.')
    router.push(`/tournaments/${params.id}/bracket`)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 gap-6">
      <div className="depth-panel rounded-3xl p-8 max-w-sm w-full text-center space-y-4 overflow-hidden">
        <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-brand-cyan/10 blur-3xl"></div>
        <div className="w-16 h-16 mx-auto rounded-2xl depth-stat flex items-center justify-center relative z-10">
          <Zap size={28} className="text-brand-cyan" />
        </div>
        <h1 className="text-2xl font-display font-black text-white">Start Tournament?</h1>
        <p className="text-slate-400 text-sm">This will set the tournament to <strong className="text-white">Live</strong> and generate the first round of matches.</p>
        <button onClick={start} disabled={starting}
          className="w-full py-3 bg-brand-cyan hover:bg-brand-lime text-white rounded-xl font-black flex items-center justify-center gap-2 disabled:opacity-40 transition-all shadow-glow-green">
          {starting ? <><Loader2 size={16} className="animate-spin" /> Starting...</> : 'Start Tournament'}
        </button>
        <Link href={`/tournaments/${params.id}/dashboard`} className="block text-sm text-slate-500 hover:text-slate-300 transition-colors">
          Cancel
        </Link>
      </div>
    </div>
  )
}
