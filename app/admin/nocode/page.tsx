'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Save, Loader2, Palette, Megaphone, Wrench, Shield, Newspaper, Award, Star, Users, Globe } from 'lucide-react'
import { clearSiteSettingsCache } from '@/hooks/useSiteSettings'

const supabase = createClient()

// ─── helpers ────────────────────────────────────────────────────────────────
async function getSetting(key: string) {
  const { data } = await supabase.from('site_settings').select('value').eq('key', key).maybeSingle()
  return data?.value ?? {}
}
async function saveSetting(key: string, value: any) {
  await supabase.from('site_settings').upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' })
  clearSiteSettingsCache()
}

function Field({ label, value, onChange, type = 'text', rows = 0 }: { label: string; value: string; onChange: (v: string) => void; type?: string; rows?: number }) {
  return (
    <div>
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">{label}</label>
      {rows > 0
        ? <textarea rows={rows} value={value ?? ''} onChange={e => onChange(e.target.value)}
            className="w-full px-3 py-2 bg-slate-800 border border-kaf-border rounded-xl text-white text-sm focus:border-brand-cyan focus:outline-none transition-all resize-none" />
        : <input type={type} value={value ?? ''} onChange={e => onChange(e.target.value)}
            className="w-full px-3 py-2 bg-slate-800 border border-kaf-border rounded-xl text-white text-sm focus:border-brand-cyan focus:outline-none transition-all" />
      }
    </div>
  )
}

function Toggle({ label, desc, checked, onChange }: { label: string; desc?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <div>
        <div className="text-sm font-bold text-white">{label}</div>
        {desc && <div className="text-xs text-slate-500 mt-0.5">{desc}</div>}
      </div>
      <button onClick={() => onChange(!checked)}
        className={`relative w-10 h-5 rounded-full transition-colors ${checked ? 'bg-brand-cyan' : 'bg-slate-700'}`}>
        <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${checked ? 'translate-x-5' : ''}`} />
      </button>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="kaf-card rounded-2xl border border-kaf-border p-5 space-y-4">
      <h3 className="font-black text-white text-sm uppercase tracking-wide">{title}</h3>
      {children}
    </div>
  )
}

// ─── Panel components ────────────────────────────────────────────────────────
function BrandingPanel() {
  const [data, setData] = useState<any>({})
  const [saving, setSaving] = useState(false)
  useEffect(() => { getSetting('branding').then(setData) }, [])
  const save = async () => { setSaving(true); await saveSetting('branding', data); setSaving(false); alert('Saved!') }
  return (
    <div className="space-y-4">
      <Section title="Branding & Identity">
        <Field label="Site Name" value={data.site_name ?? ''} onChange={v => setData({ ...data, site_name: v })} />
        <Field label="Tagline" value={data.tagline ?? ''} onChange={v => setData({ ...data, tagline: v })} />
        <Field label="Logo URL" value={data.logo_url ?? ''} onChange={v => setData({ ...data, logo_url: v })} />
        {data.logo_url && <img src={data.logo_url} alt="logo" className="h-12 w-12 rounded-lg object-contain bg-slate-800 border border-kaf-border p-1" />}
      </Section>
      <Section title="Hero Text">
        <Field label="Hero Title" value={data.hero_title ?? ''} onChange={v => setData({ ...data, hero_title: v })} />
        <Field label="Hero Subtitle" value={data.hero_subtitle ?? ''} onChange={v => setData({ ...data, hero_subtitle: v })} rows={2} />
        <div className="grid grid-cols-2 gap-3">
          <Field label="CTA Primary Text" value={data.cta_primary ?? ''} onChange={v => setData({ ...data, cta_primary: v })} />
          <Field label="CTA Primary Link" value={data.cta_primary_href ?? ''} onChange={v => setData({ ...data, cta_primary_href: v })} />
          <Field label="CTA Secondary Text" value={data.cta_secondary ?? ''} onChange={v => setData({ ...data, cta_secondary: v })} />
          <Field label="CTA Secondary Link" value={data.cta_secondary_href ?? ''} onChange={v => setData({ ...data, cta_secondary_href: v })} />
        </div>
      </Section>
      <button onClick={save} disabled={saving} className="px-6 py-2.5 bg-brand-cyan hover:bg-brand-cyan/80 text-slate-900 rounded-xl font-black text-sm flex items-center gap-2 disabled:opacity-40">
        {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save Branding
      </button>
    </div>
  )
}

function AnnouncementPanel() {
  const [data, setData] = useState<any>({ visible: false, message: '', level: 'info', link: '', link_label: '' })
  const [saving, setSaving] = useState(false)
  useEffect(() => { getSetting('announcement').then(setData) }, [])
  const save = async () => { setSaving(true); await saveSetting('announcement', data); setSaving(false); alert('Saved! Shows live to all visitors.') }
  return (
    <div className="space-y-4">
      <Section title="Site Announcement Bar">
        <Toggle label="Show Announcement" desc="Visible to all visitors in real-time" checked={!!data.visible} onChange={v => setData({ ...data, visible: v })} />
        <Field label="Message" value={data.message ?? ''} onChange={v => setData({ ...data, message: v })} rows={2} />
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Level</label>
          <div className="flex gap-2">
            {['info','warning','success','error'].map(l => (
              <button key={l} onClick={() => setData({ ...data, level: l })}
                className={`px-3 py-1 rounded-lg text-xs font-black uppercase border transition-all ${data.level === l ? 'bg-brand-cyan/10 border-brand-cyan text-brand-cyan' : 'border-kaf-border text-slate-400'}`}>{l}</button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Link URL" value={data.link ?? ''} onChange={v => setData({ ...data, link: v })} />
          <Field label="Link Label" value={data.link_label ?? ''} onChange={v => setData({ ...data, link_label: v })} />
        </div>
      </Section>
      <button onClick={save} disabled={saving} className="px-6 py-2.5 bg-brand-cyan hover:bg-brand-cyan/80 text-slate-900 rounded-xl font-black text-sm flex items-center gap-2 disabled:opacity-40">
        {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save Announcement
      </button>
    </div>
  )
}

function SiteModePanel() {
  const [data, setData] = useState<any>({ maintenance: false, clans_only: false, maintenance_message: '' })
  const [saving, setSaving] = useState(false)
  useEffect(() => { getSetting('site_mode').then(setData) }, [])
  const save = async () => { setSaving(true); await saveSetting('site_mode', data); setSaving(false); alert('Site mode updated!') }
  return (
    <div className="space-y-4">
      <Section title="Site Mode Controls">
        <Toggle label="Maintenance Mode" desc="Shows a maintenance screen to all non-admin visitors" checked={!!data.maintenance} onChange={v => setData({ ...data, maintenance: v })} />
        <Field label="Maintenance Message" value={data.maintenance_message ?? ''} onChange={v => setData({ ...data, maintenance_message: v })} rows={2} />
        <div className="h-px bg-kaf-border" />
        <Toggle label="Clans Only Mode" desc="Only allow users who are in a clan to access the platform" checked={!!data.clans_only} onChange={v => setData({ ...data, clans_only: v })} />
      </Section>
      <button onClick={save} disabled={saving} className="px-6 py-2.5 bg-orange-500 hover:bg-orange-400 text-white rounded-xl font-black text-sm flex items-center gap-2 disabled:opacity-40">
        {saving ? <Loader2 size={14} className="animate-spin" /> : <Wrench size={14} />} Apply Site Mode
      </button>
    </div>
  )
}

function FeaturesPanel() {
  const [data, setData] = useState<any>({})
  const [saving, setSaving] = useState(false)
  useEffect(() => { getSetting('features').then(setData) }, [])
  const save = async () => { setSaving(true); await saveSetting('features', data); setSaving(false); alert('Features saved!') }
  const toggles = [
    { key: 'show_news', label: 'News Section', desc: 'Show news on homepage' },
    { key: 'show_sponsors', label: 'Sponsors Carousel', desc: 'Show sponsors on homepage' },
    { key: 'show_twitch', label: 'Twitch Integration', desc: 'Show live Twitch streams' },
    { key: 'show_eleague_pinned', label: 'E-League Pinned', desc: 'Pin E-League on homepage' },
    { key: 'show_announcements', label: 'Announcements', desc: 'Enable site announcement bar' },
  ]
  return (
    <div className="space-y-4">
      <Section title="Feature Toggles">
        {toggles.map(t => (
          <Toggle key={t.key} label={t.label} desc={t.desc} checked={!!data[t.key]} onChange={v => setData({ ...data, [t.key]: v })} />
        ))}
      </Section>
      <button onClick={save} disabled={saving} className="px-6 py-2.5 bg-brand-cyan hover:bg-brand-cyan/80 text-slate-900 rounded-xl font-black text-sm flex items-center gap-2 disabled:opacity-40">
        {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save Features
      </button>
    </div>
  )
}

function SponsorsPanel() {
  const [sponsors, setSponsors] = useState<any[]>([])
  const [form, setForm] = useState({ name: '', logo_url: '', website_url: '', tier: 'standard', active: true, show_on_homepage: true })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    const { data } = await supabase.from('sponsors').select('*').order('sort_order')
    setSponsors(data ?? [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const add = async () => {
    setSaving(true)
    await supabase.from('sponsors').insert({ ...form, sort_order: sponsors.length })
    setSaving(false)
    setForm({ name: '', logo_url: '', website_url: '', tier: 'standard', active: true, show_on_homepage: true })
    load()
  }
  const del = async (id: string) => { await supabase.from('sponsors').delete().eq('id', id); load() }
  const toggle = async (id: string, active: boolean) => { await supabase.from('sponsors').update({ active }).eq('id', id); load() }

  return (
    <div className="space-y-4">
      <Section title="Add Sponsor">
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Sponsor Name" value={form.name} onChange={v => setForm({ ...form, name: v })} />
          <Field label="Logo URL" value={form.logo_url} onChange={v => setForm({ ...form, logo_url: v })} />
          <Field label="Website URL" value={form.website_url} onChange={v => setForm({ ...form, website_url: v })} />
        </div>
        <button onClick={add} disabled={saving || !form.name}
          className="px-4 py-2 bg-brand-cyan hover:bg-brand-cyan/80 text-slate-900 rounded-xl font-black text-sm flex items-center gap-2 disabled:opacity-40">
          {saving ? <Loader2 size={14} className="animate-spin" /> : '+'} Add Sponsor
        </button>
      </Section>
      <Section title={`Sponsors (${sponsors.length})`}>
        {loading ? <Loader2 size={16} className="animate-spin text-slate-500" /> : sponsors.map(s => (
          <div key={s.id} className="flex items-center gap-3 py-2 border-b border-kaf-border last:border-0">
            {s.logo_url && <img src={s.logo_url} alt={s.name} className="h-8 w-8 object-contain rounded bg-slate-800 border border-kaf-border p-0.5" />}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-white truncate">{s.name}</div>
              <div className="text-xs text-slate-500 truncate">{s.website_url}</div>
            </div>
            <button onClick={() => toggle(s.id, !s.active)}
              className={`text-xs font-bold px-2 py-0.5 rounded border ${s.active ? 'text-green-400 border-green-500/30 bg-green-500/10' : 'text-slate-500 border-slate-600/30'}`}>
              {s.active ? 'Active' : 'Off'}
            </button>
            <button onClick={() => del(s.id)} className="text-red-400 hover:text-red-300 text-xs font-bold">✕</button>
          </div>
        ))}
      </Section>
    </div>
  )
}

function BadgesPanel() {
  const [badges, setBadges] = useState<any[]>([])
  const [form, setForm] = useState({ slug: '', name: '', icon: 'Award', color: '#22d3ee', rarity: 'common', category: 'general' })
  const load = async () => { const { data } = await supabase.from('badges').select('*').order('category'); setBadges(data ?? []) }
  useEffect(() => { load() }, [])
  const add = async () => { await supabase.from('badges').insert(form); setForm({ slug: '', name: '', icon: 'Award', color: '#22d3ee', rarity: 'common', category: 'general' }); load() }
  const del = async (id: string) => { await supabase.from('badges').delete().eq('id', id); load() }
  return (
    <div className="space-y-4">
      <Section title="Create Badge">
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Slug (unique)" value={form.slug} onChange={v => setForm({ ...form, slug: v })} />
          <Field label="Name" value={form.name} onChange={v => setForm({ ...form, name: v })} />
          <Field label="Icon (Lucide name)" value={form.icon} onChange={v => setForm({ ...form, icon: v })} />
          <Field label="Color (hex)" value={form.color} onChange={v => setForm({ ...form, color: v })} type="color" />
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Rarity</label>
            <select value={form.rarity} onChange={e => setForm({ ...form, rarity: e.target.value })}
              className="w-full px-3 py-2 bg-slate-800 border border-kaf-border rounded-xl text-white text-sm">
              {['common','rare','epic','legendary'].map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <Field label="Category" value={form.category} onChange={v => setForm({ ...form, category: v })} />
        </div>
        <button onClick={add} disabled={!form.slug || !form.name}
          className="px-4 py-2 bg-brand-cyan hover:bg-brand-cyan/80 text-slate-900 rounded-xl font-black text-sm">
          + Create Badge
        </button>
      </Section>
      <Section title={`Badge Catalog (${badges.length})`}>
        {badges.map(b => (
          <div key={b.id} className="flex items-center gap-3 py-1.5 border-b border-kaf-border last:border-0">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: b.color + '22', borderColor: b.color }}>
              <span style={{ color: b.color }} className="text-xs font-black">{b.icon[0]}</span>
            </div>
            <div className="flex-1"><div className="text-sm font-bold text-white">{b.name}</div><div className="text-xs text-slate-500">{b.rarity} · {b.category}</div></div>
            <button onClick={() => del(b.id)} className="text-red-400 hover:text-red-300 text-xs">✕</button>
          </div>
        ))}
      </Section>
    </div>
  )
}

// ─── Main Admin No-Code Page ─────────────────────────────────────────────────
const TABS = [
  { id: 'branding',     label: 'Branding & Hero', Icon: Palette },
  { id: 'announcement', label: 'Announcement Bar', Icon: Megaphone },
  { id: 'sitemode',     label: 'Site Mode',        Icon: Wrench },
  { id: 'features',     label: 'Feature Toggles',  Icon: Globe },
  { id: 'sponsors',     label: 'Sponsors',          Icon: Star },
  { id: 'badges',       label: 'Badge Editor',      Icon: Award },
]

export default function NoCodeAdminPage() {
  const [tab, setTab] = useState('branding')

  return (
    <div className="flex flex-col w-full pb-20">
      <div className="border-b border-kaf-border px-6 py-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan text-xs font-black uppercase tracking-widest mb-3">
          <Shield size={10} /> No-Code Control Panel
        </div>
        <h1 className="text-3xl font-display font-black text-white uppercase">Site Controls</h1>
        <p className="text-slate-400 text-sm mt-1">Edit everything about the site without touching code.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-0">
        {/* Sidebar tabs */}
        <div className="lg:w-52 border-b lg:border-b-0 lg:border-r border-kaf-border flex lg:flex-col overflow-x-auto lg:overflow-visible p-2 gap-1 shrink-0">
          {TABS.map(t => {
            const Icon = t.Icon
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all w-full text-left ${
                  tab === t.id ? 'bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/30' : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}>
                <Icon size={14} /> {t.label}
              </button>
            )
          })}
        </div>

        {/* Panel content */}
        <div className="flex-1 p-4 sm:p-6 max-w-3xl">
          {tab === 'branding' && <BrandingPanel />}
          {tab === 'announcement' && <AnnouncementPanel />}
          {tab === 'sitemode' && <SiteModePanel />}
          {tab === 'features' && <FeaturesPanel />}
          {tab === 'sponsors' && <SponsorsPanel />}
          {tab === 'badges' && <BadgesPanel />}
        </div>
      </div>
    </div>
  )
}
