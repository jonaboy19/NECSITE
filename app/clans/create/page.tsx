'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { slugify } from '@/lib/slugify'
import { Shield, Loader2, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function CreateClan() {
  const supabase = createClient()
  const router = useRouter()
  
  const [name, setName] = useState('')
  const [tag, setTag] = useState('')
  const [bio, setBio] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setError('You must be logged in to forge a clan.')
      setIsSubmitting(false)
      return
    }

    try {
      // 1. Create the Clan
      const { data: clan, error: clanError } = await supabase.from('clans').insert({
        name,
        slug: slugify(name),
        tag: tag.toUpperCase(),
        bio,
        owner_id: user.id,
      }).select().single()

      if (clanError) throw clanError

      // 2. Add the creator as the Owner in clan_members
      const { error: memberError } = await supabase.from('clan_members').insert({
        clan_id: clan.id,
        profile_id: user.id,
        role: 'owner'
      })

      if (memberError) throw memberError

      router.push(`/clans/${clan.id}`)
    } catch (err: any) {
      setError(err.message || 'Failed to create organization.')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="kaf-app-page flex min-h-[80vh] w-full flex-col items-center justify-center p-4">
      <div className="grid w-full max-w-5xl gap-6 lg:grid-cols-[1fr_380px]">
      <div className="depth-panel kaf-cut p-6 md:p-10 relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-brand-cyan/70"></div>
        <div className="absolute right-0 top-0 h-full w-px bg-brand-cyan/20"></div>
        
        <div className="flex items-center gap-3 mb-8">
          <div className="depth-stat flex h-12 w-12 items-center justify-center border-brand-cyan/25">
            <Shield size={24} className="text-brand-lime" />
          </div>
          <div>
            <h1 className="kaf-display text-3xl text-white">Forge a Legacy</h1>
            <p className="kaf-panel-title mt-2">Clan Registration</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-status-live/10 border border-status-live/30 text-status-live text-sm font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleCreate} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Organization Name</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder='e.g., KAF Esports'
                required
                maxLength={30}
                className="kaf-input py-4 font-bold"
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Clan Tag (2-5 Chars)</label>
              <input
                value={tag}
                onChange={e => setTag(e.target.value.toUpperCase())}
                placeholder='KAF'
                required
                minLength={2}
                maxLength={5}
                className="kaf-input py-4 font-bold"
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Bio / Mission Statement</label>
              <textarea
                value={bio}
                onChange={e => setBio(e.target.value)}
                placeholder='What does your clan stand for?'
                rows={3}
                maxLength={200}
                className="kaf-input resize-none py-4 font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !name.trim()}
            className="btn-primary mt-8 w-full py-5 text-base disabled:opacity-50"
          >
            {isSubmitting ? (
              <><Loader2 size={20} className="animate-spin" /> Registering...</>
            ) : (
              <>Establish Organization <ArrowRight size={20} /></>
            )}
          </button>
        </form>
      </div>
      <aside className="depth-panel kaf-cut p-6 self-start">
        <p className="kaf-panel-title mb-4">Live Preview</p>
        <div className="border border-brand-cyan/20 bg-brand-cyan/5 p-5">
          <div className="mb-4 flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center border border-brand-cyan/25 bg-kaf-panel text-2xl font-black text-brand-lime shadow-[0_18px_38px_rgba(0,0,0,0.35)]">
              {(tag || name || 'K').slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-xl font-black text-white">{name || 'Your Clan Name'}</h2>
              <p className="font-mono text-sm font-bold text-slate-400">[{tag || 'TAG'}]</p>
            </div>
          </div>
          <p className="min-h-16 text-sm leading-relaxed text-slate-400">
            {bio || 'Your mission statement will appear here for players, opponents, and tournament hosts.'}
          </p>
          <div className="mt-5 grid grid-cols-2 gap-2">
            <div className="depth-stat rounded-xl p-3">
              <div className="text-lg font-black text-brand-gold">0</div>
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Trophies</div>
            </div>
            <div className="depth-stat rounded-xl p-3">
              <div className="text-lg font-black text-brand-cyan">1</div>
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Founder</div>
            </div>
          </div>
        </div>
      </aside>
      </div>
    </div>
  )
}
