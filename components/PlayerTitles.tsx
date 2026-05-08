'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Star, Plus, X, Loader2, ChevronDown } from 'lucide-react'

const RARITY_STYLE: Record<string, string> = {
  common:    'bg-slate-700/60 border-slate-600/50 text-slate-300',
  rare:      'bg-blue-500/20 border-blue-500/40 text-blue-300',
  epic:      'bg-purple-500/20 border-purple-500/40 text-purple-300',
  legendary: 'bg-amber-500/20 border-amber-500/40 text-amber-300',
}

interface PlayerTitlesProps { profileId: string; canEdit?: boolean }

export function PlayerTitles({ profileId, canEdit = false }: PlayerTitlesProps) {
  const supabase = createClient()
  const [titles, setTitles] = useState<any[]>([])
  const [catalog, setCatalog] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [filter, setFilter] = useState('')

  async function load() {
    const [{ data: t }, { data: c }] = await Promise.all([
      supabase.from('player_titles').select('*,catalog:title_code(label,category,rarity,color)').eq('player_id', profileId),
      supabase.from('player_titles_catalog').select('*').order('category').order('label'),
    ])
    setTitles(t ?? [])
    setCatalog(c ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [profileId])

  const ownedCodes = new Set(titles.map(t => t.title_code))

  async function addTitle(code: string) {
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('player_titles').insert({ player_id: profileId, title_code: code, awarded_by: user?.id })
    if (!error) { setAdding(false); load() }
  }

  async function removeTitle(code: string) {
    await supabase.from('player_titles').delete().eq('player_id', profileId).eq('title_code', code)
    load()
  }

  if (loading) return <Loader2 size={14} className="animate-spin text-slate-500" />
  if (!titles.length && !canEdit) return null

  const filtered = catalog.filter(c => !ownedCodes.has(c.code) && c.label.toLowerCase().includes(filter.toLowerCase()))

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5 items-center">
        {titles.map((t) => {
          const cat = t.catalog
          const style = RARITY_STYLE[cat?.rarity ?? 'common'] ?? RARITY_STYLE.common
          return (
            <span key={t.title_code}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${style} group`}
              style={cat?.color ? { borderColor: cat.color + '60', color: cat.color } : {}}>
              <Star size={8} />
              {cat?.label ?? t.title_code}
              {canEdit && (
                <button onClick={() => removeTitle(t.title_code)} className="opacity-0 group-hover:opacity-100 ml-0.5 transition-opacity">
                  <X size={8} />
                </button>
              )}
            </span>
          )
        })}
        {canEdit && (
          <button onClick={() => setAdding(!adding)}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black border border-dashed border-slate-600 text-slate-500 hover:text-brand-cyan hover:border-brand-cyan transition-colors">
            <Plus size={8} /> Add Title
          </button>
        )}
      </div>

      {/* Title picker */}
      {adding && canEdit && (
        <div className="bg-slate-900 border border-kaf-border rounded-xl p-3 space-y-2 shadow-xl">
          <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="Search titles..."
            className="w-full px-2 py-1.5 bg-slate-800 border border-kaf-border rounded-lg text-sm text-white placeholder-slate-600 focus:border-brand-cyan focus:outline-none" />
          <div className="max-h-40 overflow-y-auto space-y-1">
            {filtered.map(c => (
              <button key={c.code} onClick={() => addTitle(c.code)}
                className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-slate-800 transition-colors flex items-center justify-between group">
                <span className="text-sm text-white">{c.label}</span>
                <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full border ${RARITY_STYLE[c.rarity] ?? RARITY_STYLE.common}`}>
                  {c.rarity}
                </span>
              </button>
            ))}
            {filtered.length === 0 && <p className="text-center text-slate-500 text-xs py-2">No titles found</p>}
          </div>
        </div>
      )}
    </div>
  )
}
