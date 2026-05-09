'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Trophy, Check, AlertCircle, Sword } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function ReportMatch() {
  const supabase = createClient()
  const router = useRouter()
  
  const [matches, setMatches] = useState<any[]>([])
  const [selectedMatch, setSelectedMatch] = useState<any>(null)
  const [scoreA, setScoreA] = useState(0)
  const [scoreB, setScoreB] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState<'idle'|'success'|'error'>('idle')
  const [userId, setUserId] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    // Fetch pending matches for this user. 
    // For demo purposes, we will fetch any scheduled matches.
    const fetchMatches = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login?redirect=/matches/report&message=Sign%20in%20to%20report%20a%20match')
        return
      }
      setUserId(user.id)

      const { data } = await supabase.from('matches').select('*, tournaments(title)').in('status', ['scheduled', 'live']).limit(10)
      if (data && data.length > 0) {
        setMatches(data)
        setSelectedMatch(data[0])
      } else {
        setMatches([])
        setSelectedMatch(null)
      }
    }
    fetchMatches()
  }, [supabase])

  const report = async () => {
    setIsSubmitting(true)
    setErrorMessage('')
    try {
      if (selectedMatch.id !== 'demo-match-id') {
        const { error } = await supabase.from('match_results').insert({
          match_id: selectedMatch.id,
          submitted_by: userId,
          score_1: scoreA,
          score_2: scoreB,
          notes: 'Submitted from KAFConnect match report page',
          status: 'pending',
        })
        if (error) throw error
      }

      // Trigger the Realtime feed by inserting!
      const isWin = scoreA > scoreB;
      const resultText = isWin ? 'defeated' : scoreA === scoreB ? 'drew against' : 'lost to';
      const tickerMessage = `Match Result: Player A ${resultText} Player B (${scoreA}-${scoreB}) in ${selectedMatch.tournaments?.title || 'a Tournament'}!`
      
      await supabase.from('live_tickers').insert({
        message: tickerMessage,
        is_active: true
      })

      await supabase.from('feed_activities').insert({
        title: `Match Result: ${scoreA} - ${scoreB}`,
        description: `An intense matchup in ${selectedMatch.tournaments?.title || 'the arena'} just concluded.`,
        activity_type: 'tournament'
      })

      setStatus('success')
      setTimeout(() => {
        router.push('/')
      }, 2000)

    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to submit report.')
      setStatus('error')
    }
    setIsSubmitting(false)
  }

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-6 text-center">
        <div className="w-24 h-24 bg-emerald-500/10 border-2 border-emerald-500/50 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
          <Check size={40} className="text-emerald-400" />
        </div>
        <h1 className="text-4xl font-display font-black text-white mb-4">SCORE VERIFIED</h1>
        <p className="text-slate-400 mb-8">The match result has been submitted for review.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col w-full min-h-[80vh] items-center justify-center p-4">
      <div className="w-full max-w-lg depth-panel p-6 md:p-8 rounded-3xl relative overflow-hidden">
        <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-brand-cyan/10 blur-3xl"></div>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-cyan to-purple-500"></div>
        
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-12 h-12 rounded-xl depth-stat flex items-center justify-center">
            <Sword size={24} className="text-brand-cyan" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-black text-white">Report Score</h1>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{selectedMatch?.tournaments?.title || 'Select Match'}</p>
          </div>
        </div>

        {/* Score Selector UI */}
        {selectedMatch ? (
          <div className="flex items-center justify-between gap-4 mb-10">
            {/* Player A */}
            <div className="flex flex-col items-center flex-1">
              <div className="w-20 h-20 rounded-2xl bg-kaf-panel border-2 border-brand-cyan/50 shadow-[0_18px_38px_rgba(0,0,0,0.38),0_0_20px_rgba(25,133,59,0.2)] mb-4 bg-cover" style={{ backgroundImage: `url('https://api.dicebear.com/7.x/avataaars/svg?seed=You')` }}></div>
              <p className="font-bold text-white mb-4">You</p>
              
              <div className="flex items-center gap-3 bg-kaf-panel rounded-full p-1 border border-kaf-border">
                <button onClick={() => setScoreA(Math.max(0, scoreA - 1))} className="w-10 h-10 rounded-full bg-kaf-bg flex items-center justify-center text-xl font-bold text-slate-400 hover:text-white transition-colors">-</button>
                <span className="w-8 text-center text-3xl font-black text-brand-cyan">{scoreA}</span>
                <button onClick={() => setScoreA(scoreA + 1)} className="w-10 h-10 rounded-full bg-kaf-bg flex items-center justify-center text-xl font-bold text-slate-400 hover:text-white transition-colors">+</button>
              </div>
            </div>

            <div className="text-2xl font-black text-slate-600">VS</div>

            {/* Player B */}
            <div className="flex flex-col items-center flex-1">
              <div className="w-20 h-20 rounded-2xl bg-kaf-panel border-2 border-slate-700 mb-4 bg-cover opacity-80 shadow-[0_18px_38px_rgba(0,0,0,0.32)]" style={{ backgroundImage: `url('https://api.dicebear.com/7.x/avataaars/svg?seed=Opponent')` }}></div>
              <p className="font-bold text-white mb-4">Opponent</p>
              
              <div className="flex items-center gap-3 bg-kaf-panel rounded-full p-1 border border-kaf-border">
                <button onClick={() => setScoreB(Math.max(0, scoreB - 1))} className="w-10 h-10 rounded-full bg-kaf-bg flex items-center justify-center text-xl font-bold text-slate-400 hover:text-white transition-colors">-</button>
                <span className="w-8 text-center text-3xl font-black text-slate-300">{scoreB}</span>
                <button onClick={() => setScoreB(scoreB + 1)} className="w-10 h-10 rounded-full bg-kaf-bg flex items-center justify-center text-xl font-bold text-slate-400 hover:text-white transition-colors">+</button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-400 mb-10 border border-dashed border-kaf-border rounded-2xl">
            You have no pending matches to report.
          </div>
        )}

        {status === 'error' && (
          <div className="mb-6 p-4 rounded-xl bg-status-live/10 border border-status-live/30 flex items-center gap-3 text-status-live text-sm font-bold">
            <AlertCircle size={18} /> {errorMessage || 'Failed to submit report.'}
          </div>
        )}

        <button 
          onClick={report} 
          disabled={isSubmitting || !selectedMatch}
          className="w-full rounded-2xl bg-brand-cyan py-5 font-black text-lg text-white transition-all hover:bg-brand-lime hover:scale-105 shadow-glow-green disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
        >
          {isSubmitting ? 'Verifying...' : 'Confirm Result'} <Trophy size={20} />
        </button>
        <p className="text-center text-[10px] text-slate-500 uppercase font-bold tracking-widest mt-4">
          Falsifying match results will result in a ban.
        </p>
      </div>
    </div>
  )
}
