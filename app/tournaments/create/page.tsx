'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { slugify } from '@/lib/slugify'
import { Trophy, GitMerge, Settings, Loader2, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function CreateTournament(){
  const supabase = createClient()
  const router = useRouter()
  
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [prizePool, setPrizePool] = useState('')
  const [maxParticipants, setMaxParticipants] = useState('16')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const create = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('You must be logged in to create a tournament.')
      setIsSubmitting(false)
      return
    }

    try {
      const { data, error: insertError } = await supabase.from('tournaments').insert({
        title,
        slug: slugify(title) + '-' + Math.random().toString(36).substring(2, 6),
        description,
        prize_pool: prizePool || 'Glory and Honor',
        max_participants: parseInt(maxParticipants) || 16,
        host_id: user.id,
        status: 'registration_open'
      }).select().single()

      if (insertError) throw insertError

      router.push(`/tournaments/${data.id}/dashboard`)
    } catch (err: any) {
      setError(err.message || 'Failed to create tournament.')
      setIsSubmitting(false)
    }
  }

  return(
    <div className="flex flex-col w-full min-h-[80vh] items-center justify-center p-4">
      <div className="grid w-full max-w-6xl gap-6 lg:grid-cols-[1fr_420px]">
      <div className="depth-panel p-6 md:p-10 rounded-3xl relative overflow-hidden">
        <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-brand-cyan/10 blur-3xl"></div>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-cyan to-purple-500"></div>
        
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl depth-stat flex items-center justify-center">
            <Trophy size={24} className="text-brand-cyan" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-black text-white">Event Creator</h1>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Tournament Configuration</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-status-live/10 border border-status-live/30 text-status-live text-sm font-bold">
            {error}
          </div>
        )}

        <form onSubmit={create} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Tournament Title</label>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder='e.g., KAF E-League Season 1'
                required
                className="w-full bg-kaf-bg border border-kaf-border rounded-xl px-4 py-4 text-white font-bold placeholder-slate-600 focus:border-brand-cyan focus:outline-none transition-colors"
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Description</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder='Describe the event rules and format...'
                rows={3}
                className="w-full bg-kaf-bg border border-kaf-border rounded-xl px-4 py-4 text-white font-medium placeholder-slate-600 focus:border-brand-cyan focus:outline-none transition-colors resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Prize Pool</label>
                <input
                  value={prizePool}
                  onChange={e => setPrizePool(e.target.value)}
                  placeholder='e.g., $5,000'
                  className="w-full bg-kaf-bg border border-kaf-border rounded-xl px-4 py-4 text-white font-bold placeholder-slate-600 focus:border-brand-gold focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Max Players</label>
                <select
                  value={maxParticipants}
                  onChange={e => setMaxParticipants(e.target.value)}
                  className="w-full bg-kaf-bg border border-kaf-border rounded-xl px-4 py-4 text-white font-bold focus:border-brand-cyan focus:outline-none transition-colors appearance-none"
                >
                  <option value="8">8 Players</option>
                  <option value="16">16 Players</option>
                  <option value="32">32 Players</option>
                  <option value="64">64 Players</option>
                </select>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !title.trim()}
            className="w-full rounded-2xl bg-brand-cyan py-5 font-black text-lg text-white transition-all hover:bg-brand-lime hover:scale-105 shadow-glow-green disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2 mt-8"
          >
            {isSubmitting ? (
              <><Loader2 size={20} className="animate-spin" /> Initializing...</>
            ) : (
              <>Deploy Tournament <ArrowRight size={20} /></>
            )}
          </button>
        </form>
      </div>
      <aside className="depth-panel rounded-3xl p-6 self-start">
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500 mb-4">Event Preview</p>
        <div className="overflow-hidden rounded-2xl border border-brand-cyan/25 bg-brand-cyan/5">
          <div className="relative h-32 bg-[url('/hero-stadium.jpg')] bg-cover bg-center">
            <div className="absolute inset-0 bg-gradient-to-t from-kaf-card via-kaf-bg/40 to-transparent"></div>
            <div className="absolute bottom-3 left-3 rounded-lg border border-white/10 bg-black/35 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-white backdrop-blur">
              Registration Open
            </div>
          </div>
          <div className="p-5">
            <h2 className="text-xl font-black text-white">{title || 'Tournament Title'}</h2>
            <p className="mt-2 min-h-14 text-sm leading-relaxed text-slate-400">
              {description || 'Rules, format, and schedule notes will preview here.'}
            </p>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <div className="depth-stat rounded-xl p-3">
                <div className="text-lg font-black text-white">{maxParticipants || 16}</div>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Slots</div>
              </div>
              <div className="depth-stat rounded-xl p-3">
                <div className="truncate text-lg font-black text-brand-gold">{prizePool || 'Glory'}</div>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Prize</div>
              </div>
            </div>
          </div>
        </div>
      </aside>
      </div>
    </div>
  )
}
