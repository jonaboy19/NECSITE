'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Trophy, Check, AlertCircle, Sword, Upload } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function ReportMatch() {
  const supabase = createClient()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [matches, setMatches] = useState<any[]>([])
  const [selectedMatch, setSelectedMatch] = useState<any>(null)
  const [scoreA, setScoreA] = useState(0)
  const [scoreB, setScoreB] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [proof, setProof] = useState<File | null>(null)
  const [status, setStatus] = useState<'idle'|'success'|'error'>('idle')
  const [userId, setUserId] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const fetchMatches = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login?redirect=/matches/report&message=Sign%20in%20to%20report%20a%20match')
        return
      }
      setUserId(user.id)

      const matchId = searchParams.get('match')
      const query = supabase.from('matches').select('*, tournaments(title)').in('status', ['scheduled', 'live', 'active'])
      const { data } = matchId
        ? await query.eq('id', matchId).limit(1)
        : await query.limit(10)
      if (data && data.length > 0) {
        setMatches(data)
        setSelectedMatch(data[0])
      } else {
        setMatches([])
        setSelectedMatch(null)
      }
    }
    fetchMatches()
  }, [supabase, searchParams, router])

  const report = async () => {
    setIsSubmitting(true)
    setErrorMessage('')
    try {
      if (!selectedMatch || !userId) throw new Error('No match selected.')

      let proofUrl: string | null = null
      if (proof) {
        const ext = proof.name.split('.').pop()
        const path = `${selectedMatch.id}/result_${userId}_${Date.now()}.${ext}`
        const { error: uploadError } = await supabase.storage.from('match-evidence').upload(path, proof)
        if (uploadError) throw uploadError
        const { data: signed } = await supabase.storage.from('match-evidence').createSignedUrl(path, 60 * 60 * 24 * 7)
        proofUrl = signed?.signedUrl || path
      }

      const { data: insertedResult, error } = await supabase.from('match_results').insert({
        match_id: selectedMatch.id,
        submitted_by: userId,
        score_1: scoreA,
        score_2: scoreB,
        screenshot_url: proofUrl,
        notes: 'Submitted from KAFConnect match report page',
        status: 'pending',
      }).select('id').single()
      if (error) throw error

      if (proofUrl) {
        await supabase.from('evidence_items').insert({
          match_id: selectedMatch.id,
          uploaded_by: userId,
          evidence_type: proof?.type.startsWith('video/') ? 'clip' : 'screenshot',
          file_url: proofUrl,
          notes: `Result proof ${scoreA}-${scoreB}`,
        })
      }

      const { data: existingResults } = await supabase
        .from('match_results')
        .select('id,score_1,score_2,submitted_by')
        .eq('match_id', selectedMatch.id)
        .neq('id', insertedResult.id)
        .order('created_at', { ascending: false })
        .limit(1)

      const previous = existingResults?.[0]
      if (previous) {
        const sameScore = previous.score_1 === scoreA && previous.score_2 === scoreB
        if (sameScore) {
          await Promise.all([
            supabase.from('matches').update({
              status: 'completed',
              score_1: scoreA,
              score_2: scoreB,
              score_a: scoreA,
              score_b: scoreB,
            }).eq('id', selectedMatch.id),
            supabase.from('match_results').update({ status: 'approved' }).eq('match_id', selectedMatch.id),
            supabase.from('platform_audit_events').insert({
              actor_id: userId,
              action: 'match.result.auto_finalized',
              entity_type: 'match',
              entity_id: selectedMatch.id,
              match_id: selectedMatch.id,
              tournament_id: selectedMatch.tournament_id,
              metadata: { score_1: scoreA, score_2: scoreB },
            }),
          ])
        } else {
          const { data: dispute } = await supabase.from('disputes').insert({
            match_id: selectedMatch.id,
            opened_by: userId,
            reason: `Score mismatch: submitted ${scoreA}-${scoreB}, previous ${previous.score_1}-${previous.score_2}`,
            evidence_url: proofUrl,
            status: 'open',
          }).select('id').single()
          await Promise.all([
            supabase.from('matches').update({ status: 'disputed' }).eq('id', selectedMatch.id),
            supabase.from('platform_audit_events').insert({
              actor_id: userId,
              action: 'match.result.dispute_auto_opened',
              entity_type: 'dispute',
              entity_id: dispute?.id,
              match_id: selectedMatch.id,
              tournament_id: selectedMatch.tournament_id,
            }),
          ])
        }
      }

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

      await supabase.from('platform_audit_events').insert({
        actor_id: userId,
        action: 'match.result.submitted',
        entity_type: 'match_result',
        entity_id: insertedResult.id,
        match_id: selectedMatch.id,
        tournament_id: selectedMatch.tournament_id,
        metadata: { score_1: scoreA, score_2: scoreB, proof: !!proofUrl },
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

        {selectedMatch && (
          <div className="mb-6 rounded-2xl border border-kaf-border bg-kaf-panel p-4">
            <label className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400">
              <Upload size={13} className="text-brand-cyan" /> Proof screenshot/video
            </label>
            <input
              type="file"
              accept="image/*,video/*"
              onChange={e => setProof(e.target.files?.[0] || null)}
              className="w-full text-xs text-slate-300 file:mr-4 file:border-0 file:bg-slate-800 file:px-4 file:py-2 file:text-xs file:font-bold file:text-white hover:file:bg-slate-700"
            />
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
