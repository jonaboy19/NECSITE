'use client'
import { useState } from 'react'
import { Calendar, Play, CheckCircle, Settings, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function HostControlPanel({ tournamentId, initialStatus }: { tournamentId: string, initialStatus: string }) {
  const [status, setStatus] = useState(initialStatus)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const handleUpdateStatus = async (newStatus: string) => {
    setLoading(true)
    
    // Auto-generate matches via Edge Function if starting the tournament
    if (newStatus === 'live' && status !== 'live') {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/generate-bracket`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({ tournamentId })
        })

        if (!response.ok) {
          const errData = await response.json()
          alert('Failed to generate bracket: ' + (errData.error || response.statusText))
          setLoading(false)
          return
        }
      }
    }

    const { error } = await supabase
      .from('tournaments')
      .update({ status: newStatus })
      .eq('id', tournamentId)

    if (error) {
      alert('Failed to update tournament status: ' + error.message)
    } else {
      setStatus(newStatus)
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className="kaf-card p-6 rounded-2xl border-2 border-brand-cyan/30 bg-brand-cyan/5 relative">
      {loading && (
        <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-2xl">
          <Loader2 className="animate-spin text-brand-cyan" size={32} />
        </div>
      )}
      <h2 className="text-xl font-display font-black uppercase tracking-wider flex items-center gap-2 text-white mb-4">
        <Settings className="text-brand-cyan" size={24} /> Host Control Panel
      </h2>
      <p className="text-sm text-slate-400 mb-6">
        You have administrative privileges for this tournament. Current Status: <span className="font-bold text-white uppercase tracking-widest">{status?.replace('_', ' ')}</span>
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button 
          onClick={() => handleUpdateStatus('registration_open')}
          disabled={status === 'registration_open' || status === 'live' || status === 'completed'}
          className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all group ${
            status === 'registration_open' 
            ? 'bg-brand-gold/20 border-brand-gold/50 text-brand-gold' 
            : 'bg-slate-900 border-slate-700 hover:border-brand-gold/50 hover:bg-brand-gold/10'
          }`}
        >
          <Calendar size={24} className={`${status === 'registration_open' ? 'text-brand-gold' : 'text-slate-400 group-hover:text-brand-gold'} mb-2 transition-transform group-hover:scale-110`} />
          <span className="font-bold text-white text-sm">Open Registration</span>
        </button>
        
        <button 
          onClick={() => {
            if(confirm('Are you sure you want to start the tournament? This will generate the bracket.')) {
              handleUpdateStatus('live')
            }
          }}
          disabled={status === 'live' || status === 'completed'}
          className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all group ${
            status === 'live' 
            ? 'bg-status-live/20 border-status-live/50 text-status-live' 
            : 'bg-slate-900 border-slate-700 hover:border-status-live/50 hover:bg-status-live/10'
          }`}
        >
          <Play size={24} className={`${status === 'live' ? 'text-status-live' : 'text-slate-400 group-hover:text-status-live'} mb-2 transition-transform group-hover:scale-110`} />
          <span className="font-bold text-white text-sm">Start Tournament</span>
        </button>
        
        <button 
          onClick={() => {
            if(confirm('Mark this tournament as completed?')) {
              handleUpdateStatus('completed')
            }
          }}
          disabled={status === 'completed'}
          className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all group ${
            status === 'completed' 
            ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-500' 
            : 'bg-slate-900 border-slate-700 hover:border-emerald-500/50 hover:bg-emerald-500/10'
          }`}
        >
          <CheckCircle size={24} className={`${status === 'completed' ? 'text-emerald-500' : 'text-slate-400 group-hover:text-emerald-500'} mb-2 transition-transform group-hover:scale-110`} />
          <span className="font-bold text-white text-sm">Complete Event</span>
        </button>
      </div>
      
      <div className="mt-4 pt-4 border-t border-brand-cyan/20 flex justify-end">
        <button className="text-xs font-bold text-brand-cyan hover:underline uppercase tracking-widest">Edit Details (Coming Soon)</button>
      </div>
    </div>
  )
}
