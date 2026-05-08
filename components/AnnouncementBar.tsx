'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Megaphone, X, AlertTriangle, Info, CheckCircle2 } from 'lucide-react'

type Ann = { visible?: boolean; message?: string; level?: 'info'|'warning'|'success'|'error'; link?: string; link_label?: string }
const KEY = 'kaf.dismissedAnnouncement'

export function AnnouncementBar() {
  const supabase = createClient()
  const [ann, setAnn] = useState<Ann>({})
  const [dismissedHash, setDismissedHash] = useState<string>(() => {
    try { return localStorage.getItem(KEY) || '' } catch { return '' }
  })

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('site_settings').select('value').eq('key', 'announcement').maybeSingle()
      if (data?.value) setAnn(data.value as Ann)
    }
    fetch()

    // Real-time updates
    const ch = supabase.channel('ann_watch')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'site_settings', filter: 'key=eq.announcement' },
        (p: any) => setAnn((p.new?.value as Ann) ?? {}))
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [supabase])

  if (!ann.visible || !ann.message) return null
  const hash = ann.message + (ann.link || '') + (ann.level || '')
  if (dismissedHash === hash) return null

  const styles = {
    error:   'bg-red-500/10 border-red-500/30 text-red-400',
    warning: 'bg-orange-500/10 border-orange-500/30 text-orange-400',
    success: 'bg-green-500/10 border-green-500/30 text-green-400',
    info:    'bg-brand-cyan/10 border-brand-cyan/30 text-brand-cyan',
  }
  const style = styles[ann.level ?? 'info']
  const Icon = ann.level === 'error' || ann.level === 'warning' ? AlertTriangle
    : ann.level === 'success' ? CheckCircle2
    : Megaphone

  const dismiss = () => {
    try { localStorage.setItem(KEY, hash) } catch {}
    setDismissedHash(hash)
  }

  return (
    <div className={`border-b ${style} px-4 py-2.5 flex items-center gap-3 text-sm animate-slideDown`}>
      <Icon size={14} className="shrink-0" />
      <span className="flex-1 min-w-0 truncate font-medium">{ann.message}</span>
      {ann.link && ann.link_label && (
        <a href={ann.link} className="text-xs font-black uppercase tracking-widest underline shrink-0">
          {ann.link_label}
        </a>
      )}
      <button onClick={dismiss} className="p-1 rounded hover:bg-white/10 shrink-0 transition-colors" aria-label="Dismiss">
        <X size={12} />
      </button>
    </div>
  )
}
