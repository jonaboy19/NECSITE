'use client'
import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Search, Loader2, Trophy, Shield, Users, X } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type Hit = { id: string; type: 'player'|'clan'|'tournament'; label: string; sub?: string; href: string }

export function GlobalSearch({ open, onClose }: { open: boolean; onClose: () => void }) {
  const supabase = createClient()
  const router = useRouter()
  const [q, setQ] = useState('')
  const [hits, setHits] = useState<Hit[]>([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50)
    else { setQ(''); setHits([]) }
  }, [open])

  useEffect(() => {
    if (!q.trim() || q.trim().length < 2) { setHits([]); return }
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
      const out: Hit[] = [
        ...(pl.data ?? []).map((p: any) => ({ id: p.id, type: 'player' as const, label: p.display_name || p.username, sub: p.country, href: `/profile/${p.username}` })),
        ...(cl.data ?? []).map((c: any) => ({ id: c.id, type: 'clan' as const, label: `[${c.tag}] ${c.name}`, sub: c.region, href: `/clans/${c.id}` })),
        ...(tn.data ?? []).map((t: any) => ({ id: t.id, type: 'tournament' as const, label: t.title, sub: t.status, href: `/tournaments/${t.id}` })),
      ]
      setHits(out)
      setLoading(false)
    }, 200)
    return () => { cancelled = true; clearTimeout(t) }
  }, [q])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.key === 'k') && (e.metaKey || e.ctrlKey)) { e.preventDefault(); open ? onClose() : null }
      if (e.key === 'Escape' && open) onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  const ICONS = { player: Users, clan: Shield, tournament: Trophy }

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[10vh] px-4 bg-black/70 backdrop-blur-sm animate-fadeIn" onClick={onClose}>
      <div className="w-full max-w-2xl bg-slate-900 border border-kaf-border rounded-2xl overflow-hidden shadow-2xl animate-slideDown" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 px-4 border-b border-kaf-border">
          <Search size={16} className="text-slate-400 shrink-0" />
          <input ref={inputRef} value={q} onChange={e => setQ(e.target.value)}
            placeholder="Search players, clans, tournaments…"
            className="flex-1 py-4 bg-transparent outline-none text-sm text-white placeholder-slate-500" />
          {loading && <Loader2 size={14} className="animate-spin text-slate-400" />}
          <kbd className="text-[10px] text-slate-500 border border-kaf-border rounded px-1.5 py-0.5">ESC</kbd>
          <button onClick={onClose} className="p-1 rounded hover:bg-white/10 text-slate-400 transition-colors"><X size={14} /></button>
        </div>
        <div className="max-h-[60vh] overflow-auto">
          {hits.length === 0 && q.length >= 2 && !loading && (
            <div className="p-8 text-center text-sm text-slate-500">No results for "{q}"</div>
          )}
          {hits.length === 0 && q.length < 2 && (
            <div className="p-8 text-center text-xs text-slate-500 font-mono uppercase tracking-wider">
              Type at least 2 characters · ⌘K to toggle
            </div>
          )}
          {hits.map((h, i) => {
            const Icon = ICONS[h.type]
            return (
              <button key={h.id + i} onClick={() => { onClose(); router.push(h.href) }}
                className="w-full text-left px-4 py-3 hover:bg-white/5 flex items-center gap-3 border-b border-kaf-border last:border-0 transition-colors">
                <Icon size={16} className="text-brand-cyan shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-white truncate">{h.label}</div>
                  {h.sub && <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 truncate">{h.type} · {h.sub}</div>}
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
