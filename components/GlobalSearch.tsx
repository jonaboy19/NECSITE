'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Search, Loader2, Trophy, Shield, Users, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

type Hit = { id: string; type: 'player' | 'clan' | 'tournament'; label: string; sub?: string; href: string }

export function GlobalSearch({ open, onClose }: { open: boolean; onClose: () => void }) {
  const supabase = useMemo(() => createClient(), [])
  const router = useRouter()
  const [q, setQ] = useState('')
  const [hits, setHits] = useState<Hit[]>([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50)
    else {
      setQ('')
      setHits([])
    }
  }, [open])

  useEffect(() => {
    if (!q.trim() || q.trim().length < 2) {
      setHits([])
      return
    }

    let cancelled = false
    const t = setTimeout(async () => {
      setLoading(true)
      const term = `%${q.trim()}%`
      const [pl, cl, tn] = await Promise.all([
        supabase.from('profiles').select('id,username,display_name,country').or(`username.ilike.${term},display_name.ilike.${term}`).limit(6),
        supabase.from('clans').select('id,name,tag,region').or(`name.ilike.${term},tag.ilike.${term}`).limit(6),
        supabase.from('tournaments').select('id,title,status').ilike('title', term).limit(6),
      ])

      if (cancelled) return
      setHits([
        ...(pl.data ?? []).map((p: any) => ({ id: p.id, type: 'player' as const, label: p.display_name || p.username, sub: p.country, href: `/profile/${p.username}` })),
        ...(cl.data ?? []).map((c: any) => ({ id: c.id, type: 'clan' as const, label: `[${c.tag}] ${c.name}`, sub: c.region, href: `/clans/${c.id}` })),
        ...(tn.data ?? []).map((t: any) => ({ id: t.id, type: 'tournament' as const, label: t.title, sub: t.status, href: `/tournaments/${t.id}` })),
      ])
      setLoading(false)
    }, 200)

    return () => {
      cancelled = true
      clearTimeout(t)
    }
  }, [q, supabase])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  const ICONS = { player: Users, clan: Shield, tournament: Trophy }

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center bg-black/70 px-4 pt-[10vh] backdrop-blur-sm animate-fadeIn" onClick={onClose}>
      <div className="w-full max-w-2xl overflow-hidden rounded-xl border border-kaf-border bg-slate-900 shadow-2xl animate-slideDown" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 border-b border-kaf-border px-4">
          <Search size={16} className="shrink-0 text-slate-400" />
          <input
            ref={inputRef}
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search players, clans, tournaments..."
            className="flex-1 bg-transparent py-4 text-sm text-white outline-none placeholder-slate-500"
          />
          {loading && <Loader2 size={14} className="animate-spin text-slate-400" />}
          <kbd className="rounded border border-kaf-border px-1.5 py-0.5 text-[10px] text-slate-500">ESC</kbd>
          <button onClick={onClose} className="rounded p-1 text-slate-400 transition-colors hover:bg-white/10" aria-label="Close search">
            <X size={14} />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-auto">
          {hits.length === 0 && q.length >= 2 && !loading && (
            <div className="p-8 text-center text-sm text-slate-500">No results for "{q}"</div>
          )}
          {hits.length === 0 && q.length < 2 && (
            <div className="p-8 text-center font-mono text-xs uppercase tracking-wider text-slate-500">
              Type at least 2 characters - Ctrl K to toggle
            </div>
          )}
          {hits.map((h, i) => {
            const Icon = ICONS[h.type]
            return (
              <button
                key={h.id + i}
                onClick={() => {
                  onClose()
                  router.push(h.href)
                }}
                className="flex w-full items-center gap-3 border-b border-kaf-border px-4 py-3 text-left transition-colors last:border-0 hover:bg-white/5"
              >
                <Icon size={16} className="shrink-0 text-brand-cyan" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-bold text-white">{h.label}</div>
                  {h.sub && <div className="truncate font-mono text-[10px] uppercase tracking-wider text-slate-500">{h.type} - {h.sub}</div>}
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
