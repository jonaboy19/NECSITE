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
    <div className="flex flex-col w-full min-h-[80vh] items-center justify-center p-4">
      <div className="w-full max-w-lg kaf-card p-6 md:p-10 rounded-3xl border border-kaf-border relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-brand-cyan"></div>
        
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-kaf-panel border border-kaf-border flex items-center justify-center shadow-lg">
            <Shield size={24} className="text-purple-400" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-black text-white">Forge a Legacy</h1>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Clan Registration</p>
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
                className="w-full bg-kaf-bg border border-kaf-border rounded-xl px-4 py-4 text-white font-bold placeholder-slate-600 focus:border-purple-400 focus:outline-none transition-colors"
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
                className="w-full bg-kaf-bg border border-kaf-border rounded-xl px-4 py-4 text-white font-bold placeholder-slate-600 focus:border-purple-400 focus:outline-none transition-colors"
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
                className="w-full bg-kaf-bg border border-kaf-border rounded-xl px-4 py-4 text-white font-medium placeholder-slate-600 focus:border-purple-400 focus:outline-none transition-colors resize-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !name.trim()}
            className="w-full rounded-2xl bg-purple-600 py-5 font-black text-lg text-white transition-all hover:bg-purple-500 hover:scale-105 shadow-[0_0_20px_rgba(168,85,247,0.4)] disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2 mt-8"
          >
            {isSubmitting ? (
              <><Loader2 size={20} className="animate-spin" /> Registering...</>
            ) : (
              <>Establish Organization <ArrowRight size={20} /></>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}