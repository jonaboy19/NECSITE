'use client'
import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export type SiteSettings = {
  branding?: { site_name?: string; tagline?: string; logo_url?: string | null }
  hero?: {
    title?: string; subtitle?: string
    cta_primary?: string; cta_primary_href?: string
    cta_secondary?: string; cta_secondary_href?: string
  }
  theme?: { primary?: string; accent?: string; gold?: string; background?: string; radius?: string }
  features?: { show_news?: boolean; show_sponsors?: boolean; show_twitch?: boolean; show_eleague_pinned?: boolean; show_announcements?: boolean }
  site_mode?: { maintenance?: boolean; clans_only?: boolean; maintenance_message?: string }
  announcement?: { visible?: boolean; message?: string; level?: 'info'|'warning'|'success'|'error'; link?: string; link_label?: string }
  nav?: { primary?: string[]; mobile?: string[] }
}

const DEFAULTS: SiteSettings = {
  branding: { site_name: 'KAFConnect', tagline: 'KAF eSports Hub', logo_url: null },
  hero: {
    title: 'The Official KAF eSports Platform',
    subtitle: 'Clans, Tournaments, Leagues — all in one place.',
    cta_primary: 'Browse Tournaments', cta_primary_href: '/tournaments',
    cta_secondary: 'Join a Clan', cta_secondary_href: '/clans',
  },
  theme: { primary: '194 100% 45%', gold: '43 90% 55%', background: '220 20% 6%', radius: '0.75rem' },
  features: { show_news: true, show_sponsors: true, show_twitch: true, show_eleague_pinned: true, show_announcements: true },
  site_mode: { maintenance: false, clans_only: false, maintenance_message: 'Platform is under maintenance.' },
  announcement: { visible: false, message: '', level: 'info', link: '', link_label: '' },
  nav: { primary: ['tournaments','clans','players','rankings','news'], mobile: ['home','tournaments','clans','dashboard','profile'] },
}

let _cache: SiteSettings | null = null

export function useSiteSettings() {
  const supabase = createClient()
  const [settings, setSettings] = useState<SiteSettings>(_cache ?? DEFAULTS)
  const [loaded, setLoaded] = useState(!!_cache)

  const reload = useCallback(async () => {
    const { data } = await supabase.from('site_settings').select('key,value')
    if (!data) return
    const merged = { ...DEFAULTS } as any
    data.forEach((row: any) => { merged[row.key] = { ...(DEFAULTS as any)[row.key], ...row.value } })
    _cache = merged
    setSettings(merged)
    setLoaded(true)
  }, [supabase])

  useEffect(() => {
    if (_cache) { setLoaded(true); return }
    reload()
  }, [reload])

  return { settings, loaded, reload }
}

export function clearSiteSettingsCache() { _cache = null }
