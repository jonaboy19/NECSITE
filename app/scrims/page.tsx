'use client'

import { useEffect, useMemo, useState } from 'react'
import { Swords, Plus, X, Clock, Users, Globe, ChevronRight, Filter } from 'lucide-react'
import { useToast } from '@/components/Toast'
import { createClient } from '@/lib/supabase/client'

const REGIONS = ['All Regions', 'EU', 'NA', 'SA', 'ASIA', 'MENA', 'OCE']
const FORMATS = ['All Formats', '1v1', '2v2', '5v5', '11v11']

function PostScrimModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({ region: 'EU', format: '1v1', note: '' })
  const [loading, setLoading] = useState(false)
  const { success, error } = useToast()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      error('Sign in before posting a scrim request.')
      setLoading(false)
      return
    }

    const { data: membership } = await supabase
      .from('clan_members')
      .select('clan_id, role')
      .eq('profile_id', user.id)
      .in('role', ['owner', 'captain', 'manager'])
      .limit(1)
      .maybeSingle()

    if (!membership?.clan_id) {
      error('Only clan staff can post scrim requests.')
      setLoading(false)
      return
    }

    const playerCount = Number.parseInt(form.format, 10) || 1
    const { error: insertError } = await supabase.from('scrim_challenges').insert({
      posting_clan_id: membership.clan_id,
      posted_by: user.id,
      region: form.region,
      player_count: playerCount,
      notes: form.note,
      status: 'open',
    })

    setLoading(false)
    if (insertError) {
      error(insertError.message)
      return
    }
    success('Scrim request posted! Players will reach out via Discord.')
    onSuccess()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md bg-kaf-card border border-kaf-border rounded-2xl shadow-2xl animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-kaf-border">
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Swords size={20} className="text-brand-cyan" /> Post Scrim Request
          </h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Region</label>
              <select
                className="w-full bg-kaf-bg border border-kaf-border rounded-xl px-3 py-2.5 text-white text-sm focus:border-brand-cyan focus:outline-none transition-all"
                value={form.region}
                onChange={e => setForm({ ...form, region: e.target.value })}
              >
                {REGIONS.slice(1).map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Format</label>
              <select
                className="w-full bg-kaf-bg border border-kaf-border rounded-xl px-3 py-2.5 text-white text-sm focus:border-brand-cyan focus:outline-none transition-all"
                value={form.format}
                onChange={e => setForm({ ...form, format: e.target.value })}
              >
                {FORMATS.slice(1).map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Message to Opponents</label>
            <textarea
              className="w-full bg-kaf-bg border border-kaf-border rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm resize-none h-24 focus:border-brand-cyan focus:outline-none transition-all"
              placeholder="e.g. Looking for a serious 1v1, rated 1200+. Discord DMs open."
              value={form.note}
              onChange={e => setForm({ ...form, note: e.target.value })}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-brand-cyan text-kaf-bg font-black hover:bg-white hover:scale-105 transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(0,255,102,0.3)] flex items-center justify-center gap-2"
          >
            {loading ? 'Posting...' : <><Plus size={18} /> Post Request</>}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function Scrims() {
  const [showModal, setShowModal] = useState(false)
  const [region, setRegion] = useState('All Regions')
  const [format, setFormat] = useState('All Formats')
  const [refreshKey, setRefreshKey] = useState(0)
  const [scrims, setScrims] = useState<any[]>([])
  const [clans, setClans] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const { success, error } = useToast()
  const supabase = createClient()

  useEffect(() => {
    let ignore = false
    async function loadScrims() {
      setLoading(true)
      const { data } = await supabase
        .from('scrim_challenges')
        .select('*')
        .eq('status', 'open')
        .order('created_at', { ascending: false })
        .limit(50)

      if (ignore) return
      const rows = data || []
      setScrims(rows)

      const clanIds = [...new Set(rows.map((s: any) => s.posting_clan_id).filter(Boolean))]
      if (clanIds.length) {
        const { data: clanRows } = await supabase.from('clans').select('id,name,tag,logo_url').in('id', clanIds)
        if (!ignore) {
          const map: Record<string, any> = {}
          ;(clanRows || []).forEach((c: any) => { map[c.id] = c })
          setClans(map)
        }
      } else {
        setClans({})
      }
      if (!ignore) setLoading(false)
    }
    loadScrims()
    return () => { ignore = true }
  }, [refreshKey, supabase])

  async function acceptScrim(scrimId: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      error('Sign in before accepting a scrim.')
      return
    }
    const { data: membership } = await supabase
      .from('clan_members')
      .select('clan_id, role')
      .eq('profile_id', user.id)
      .in('role', ['owner', 'captain', 'manager'])
      .limit(1)
      .maybeSingle()
    if (!membership?.clan_id) {
      error('Only clan staff can accept scrims.')
      return
    }
    const { error: updateError } = await supabase
      .from('scrim_challenges')
      .update({ status: 'accepted', accepted_clan_id: membership.clan_id, accepted_at: new Date().toISOString() })
      .eq('id', scrimId)
    if (updateError) {
      error(updateError.message)
      return
    }
    success('Scrim accepted.')
    setRefreshKey(k => k + 1)
  }

  const filtered = useMemo(() => scrims.filter(s =>
    (region === 'All Regions' || s.region === region) &&
    (format === 'All Formats' || `${s.player_count}v${s.player_count}` === format)
  ), [scrims, region, format])

  return (
    <div className="kaf-app-page flex w-full flex-col space-y-8 p-6 lg:p-8">
      {showModal && (
        <PostScrimModal
          onClose={() => setShowModal(false)}
          onSuccess={() => setRefreshKey(k => k + 1)}
        />
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-kaf-border pb-6">
        <div>
          <h1 className="kaf-display flex items-center gap-3 text-4xl text-white">
            <Swords className="text-brand-cyan" size={36} /> Scrim Finder
          </h1>
          <p className="text-slate-400 mt-2">Find and schedule practice matches against other players and clans.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary px-6 py-3"
        >
          <Plus size={20} /> Post Scrim Request
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <Filter size={16} className="text-slate-500" />
        <div className="flex gap-2 flex-wrap">
          {REGIONS.map(r => (
            <button
              key={r}
              onClick={() => setRegion(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${region === r ? 'bg-brand-cyan/20 text-brand-cyan border-brand-cyan/40' : 'bg-kaf-card border-kaf-border text-slate-400 hover:text-white'}`}
            >
              {r}
            </button>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap ml-2 border-l border-kaf-border pl-4">
          {FORMATS.map(f => (
            <button
              key={f}
              onClick={() => setFormat(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${format === f ? 'bg-brand-cyan/20 text-brand-cyan border-brand-cyan/40' : 'bg-kaf-card border-kaf-border text-slate-400 hover:text-white'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Scrim Cards */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="kaf-card kaf-cut border border-kaf-border p-12 text-center">
            <Swords size={48} className="text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">{loading ? 'Loading scrim requests' : 'No scrim requests found'}</h3>
            <p className="text-slate-400 max-w-md mx-auto">{loading ? 'Checking the live scrim board.' : 'Try adjusting the filters or be the first to post a request.'}</p>
          </div>
        ) : (
          filtered.map(scrim => (
            <div key={scrim.id} className="kaf-card kaf-cut flex flex-col gap-4 border border-kaf-border p-5 transition-all hover:border-brand-cyan/30 sm:flex-row sm:items-center">
              <div className="h-14 w-14 shrink-0 border border-kaf-border bg-slate-800 bg-cover bg-center"
                style={{ backgroundImage: clans[scrim.posting_clan_id]?.logo_url ? `url('${clans[scrim.posting_clan_id].logo_url}')` : undefined }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="font-black text-white transition-colors group-hover:text-brand-cyan">{clans[scrim.posting_clan_id]?.name || 'Clan Scrim'}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-kaf-bg border border-kaf-border text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                    <Globe size={10} /> {scrim.region}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan font-bold uppercase tracking-wider flex items-center gap-1">
                    <Swords size={10} /> {scrim.player_count}v{scrim.player_count}
                  </span>
                </div>
                <p className="text-sm text-slate-400 mb-1 line-clamp-1">{scrim.notes}</p>
                <div className="flex items-center gap-3 text-xs text-slate-600 font-bold uppercase tracking-widest">
                  <span className="flex items-center gap-1"><Clock size={10} /> {new Date(scrim.created_at).toLocaleString()}</span>
                  {clans[scrim.posting_clan_id]?.tag && <span>[{clans[scrim.posting_clan_id].tag}]</span>}
                </div>
              </div>
              <button onClick={() => acceptScrim(scrim.id)} className="flex shrink-0 items-center gap-2 border border-brand-cyan/30 bg-brand-cyan/10 px-5 py-2.5 text-sm font-bold text-brand-cyan transition-all hover:bg-brand-cyan hover:text-kaf-bg">
                Challenge <ChevronRight size={16} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
